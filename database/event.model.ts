import { HydratedDocument, Model, Schema, model, models } from "mongoose";

export interface IEvent {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

type EventModel = Model<IEvent>;

type RequiredStringField =
    | "title"
    | "description"
    | "overview"
    | "image"
    | "venue"
    | "location"
    | "date"
    | "time"
    | "mode"
    | "audience"
    | "organizer";

const requiredStringFields: RequiredStringField[] = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
];

const slugify = (value: string): string =>
    value
        .trim()
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const normalizeDateToIso = (value: string): string => {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Event date must be a valid date");
    }

    return parsedDate.toISOString();
};

const normalizeTime = (value: string): string => {
    const normalized = value.trim().toUpperCase();
    const twentyFourHour = /^([01]?\d|2[0-3]):([0-5]\d)$/;
    const twelveHour = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/;

    const twentyFourHourMatch = normalized.match(twentyFourHour);
    if (twentyFourHourMatch) {
        const [hours, minutes] = normalized.split(":");
        return `${hours.padStart(2, "0")}:${minutes}`;
    }

    const twelveHourMatch = normalized.match(twelveHour);
    if (!twelveHourMatch) {
        throw new Error("Event time must be in HH:mm or h:mm AM/PM format");
    }

    const [, hourValue, minuteValue, meridiem] = twelveHourMatch;
    let hours = Number.parseInt(hourValue, 10);

    if (meridiem === "AM" && hours === 12) {
        hours = 0;
    } else if (meridiem === "PM" && hours !== 12) {
        hours += 12;
    }

    return `${String(hours).padStart(2, "0")}:${minuteValue}`;
};

const normalizeRequiredTextFields = (doc: HydratedDocument<IEvent>): void => {
    for (const field of requiredStringFields) {
        const value = doc.get(field);
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new Error(`Event ${field} is required`);
        }

        doc.set(field, value.trim());
    }
};

const normalizeStringList = (fieldName: "agenda" | "tags", values: string[]): string[] => {
    if (!Array.isArray(values) || values.length === 0) {
        throw new Error(`Event ${fieldName} must contain at least one item`);
    }

    const normalized = values.map((item) => item.trim()).filter((item) => item.length > 0);

    if (normalized.length === 0) {
        throw new Error(`Event ${fieldName} must contain non-empty values`);
    }

    return normalized;
};

const eventSchema = new Schema<IEvent, EventModel>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, trim: true, lowercase: true },
        description: { type: String, required: true, trim: true },
        overview: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
        venue: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        date: { type: String, required: true, trim: true },
        time: { type: String, required: true, trim: true },
        mode: { type: String, required: true, trim: true },
        audience: { type: String, required: true, trim: true },
        agenda: { type: [String], required: true },
        organizer: { type: String, required: true, trim: true },
        tags: { type: [String], required: true },
    },
    {
        timestamps: true,
    },
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", function (next) {
    try {
        normalizeRequiredTextFields(this);
        this.agenda = normalizeStringList("agenda", this.agenda);
        this.tags = normalizeStringList("tags", this.tags);

        // Slug is regenerated only when title changes (or if it's missing).
        if (this.isModified("title") || !this.slug) {
            const generatedSlug = slugify(this.title);
            if (!generatedSlug) {
                throw new Error("Event slug could not be generated from title");
            }

            this.slug = generatedSlug;
        }

        // Date/time are normalized before persistence for consistent querying.
        this.date = normalizeDateToIso(this.date);
        this.time = normalizeTime(this.time);

        next();
    } catch (error) {
        next(error as Error);
    }
});

export const Event: EventModel =
    (models.Event as EventModel) ?? model<IEvent, EventModel>("Event", eventSchema);

export default Event;
