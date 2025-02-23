import nodemailer from "nodemailer";
import { Booking, Room, Guest } from "@prisma/client";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const emailTemplate = (content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${process.env.LOGO_URL}" alt="Hotel Oasis Logo" style="max-width: 200px;">
    </div>
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      ${content}
    </div>
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
      <p>Hotel Oasis - Su hogar lejos de casa</p>
    </div>
  </div>
`;

const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const emailService = {
  async sendGuestBookingConfirmation(
    booking: Booking & {
      guest: Guest;
      room: Room;
    }
  ) {
    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
    const content = `
      <h1 style="color: #2c5282; margin-bottom: 20px;">¡Gracias por su reserva!</h1>
      <p>Estimado/a ${booking.guest.firstName} ${booking.guest.lastName},</p>
      <p>Hemos recibido su solicitud de reserva. Nuestro personal de recepción se pondrá en contacto con usted 
         en breve para confirmar la disponibilidad de la habitación y finalizar su reserva.</p>
      <p>Detalles de su reserva:</p>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 10px 0;">📅 Check-in: ${booking.checkInDate.toLocaleDateString()}</li>
        <li style="margin: 10px 0;">📅 Check-out: ${booking.checkOutDate.toLocaleDateString()}</li>
        <li style="margin: 10px 0;">🌙 Noches: ${nights}</li>
        <li style="margin: 10px 0;">🏠 Tipo de Habitación: ${
          booking.room.type
        }</li>
        <li style="margin: 10px 0;">👥 Número de Huéspedes: ${
          booking.numberOfGuests
        }</li>
        <li style="margin: 10px 0;">💰 Precio Total: $${Number(
          booking.totalPrice
        ).toFixed(2)}</li>
      </ul>
      <p style="margin-top: 20px;">Si tiene alguna pregunta, no dude en contactarnos.</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: booking.guest.email,
      subject: "Confirmación de Reserva - Hotel Oasis",
      html: emailTemplate(content),
    });
  },

  async sendStaffBookingNotification(
    booking: Booking & {
      guest: Guest;
      room: Room;
    }
  ) {
    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
    const content = `
      <h1 style="color: #2c5282; margin-bottom: 20px;">Nueva Solicitud de Reserva</h1>
      <p>Se ha registrado una nueva solicitud de reserva que requiere confirmación:</p>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 10px 0;">👤 Huésped: ${booking.guest.firstName} ${
      booking.guest.lastName
    }</li>
        <li style="margin: 10px 0;">📧 Email: ${booking.guest.email}</li>
        <li style="margin: 10px 0;">📞 Teléfono: ${
          booking.guest.phoneNumber
        }</li>
        <li style="margin: 10px 0;">📅 Check-in: ${booking.checkInDate.toLocaleDateString()}</li>
        <li style="margin: 10px 0;">📅 Check-out: ${booking.checkOutDate.toLocaleDateString()}</li>
        <li style="margin: 10px 0;">🌙 Noches: ${nights}</li>
        <li style="margin: 10px 0;">🏠 Tipo de Habitación: ${
          booking.room.type
        }</li>
        <li style="margin: 10px 0;">👥 Número de Huéspedes: ${
          booking.numberOfGuests
        }</li>
        <li style="margin: 10px 0;">💰 Precio Total: $${Number(
          booking.totalPrice
        ).toFixed(2)}</li>
      </ul>
      <p style="margin-top: 20px; color: #e53e3e;">Por favor, verificar la disponibilidad y contactar al huésped para confirmar la reserva.</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.STAFF_EMAIL,
      subject: "Nueva Reserva Registrada",
      html: emailTemplate(content),
    });
  },
};
