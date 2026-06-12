import { Model, Schema, Types, model, models } from "mongoose";

import { Event } from "./event.model";

export interface IBooking {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

type BookingModel = Model<IBooking>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking, BookingModel>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    },
);

bookingSchema.index({ eventId: 1 });

bookingSchema.pre("save", async function (next) {
    try {
        const normalizedEmail = this.email?.trim().toLowerCase();
        if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
            throw new Error("Booking email must be a valid email address");
        }
        this.email = normalizedEmail;

        // Only verify relation when creating a booking or changing eventId.
        if (this.isNew || this.isModified("eventId")) {
            const eventExists = await Event.exists({ _id: this.eventId });
            if (!eventExists) {
                throw new Error("Booking eventId must reference an existing event");
            }
        }

        next();
    } catch (error) {
        next(error as Error);
    }
});

export const Booking: BookingModel =
    (models.Booking as BookingModel) ?? model<IBooking, BookingModel>("Booking", bookingSchema);

export default Booking;
