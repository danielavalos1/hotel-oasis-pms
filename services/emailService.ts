import nodemailer from "nodemailer";
import { Booking, BookingRoom, Guest, Room } from "@prisma/client";

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

// Define the type for booking with relations according to new schema
type BookingWithRelations = Booking & {
  guest: Guest;
  bookingRooms: (BookingRoom & {
    room: Room;
  })[];
};

export const emailService = {
  async sendGuestBookingConfirmation(booking: BookingWithRelations) {
    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

    // Group rooms by type and count them
    const roomsByType = booking.bookingRooms.reduce((acc, br) => {
      const roomType = br.room.type;
      if (!acc[roomType]) {
        acc[roomType] = {
          count: 0,
          price: 0,
        };
      }
      acc[roomType].count += 1;
      acc[roomType].price = Number(br.priceAtTime);
      return acc;
    }, {} as Record<string, { count: number; price: number }>);

    // Generate room list with clear pricing
    const roomsList = Object.entries(roomsByType)
      .map(
        ([type, { count, price }]) => `
      <li style="margin: 10px 0; padding: 10px; background-color: #f9fafb; border-radius: 4px;">
        🏠 ${count} × Habitación ${type}
        <div style="margin-left: 20px; font-size: 14px; color: #4a5568;">
          <div>Precio por noche: $${price.toFixed(2)}</div>
          <div>Subtotal por ${nights} noches: $${(price * nights).toFixed(
          2
        )}</div>
        </div>
      </li>
    `
      )
      .join("");

    // Calculate charges breakdown
    const subtotal = Number(booking.totalPrice);
    const tax = 0; // If you have tax information, calculate it here
    const total = subtotal + tax;

    const content = `
      <h1 style="color: #2c5282; margin-bottom: 20px; text-align: center;">¡Gracias por su reserva!</h1>
      
      <div style="background-color: #ebf4ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p>Estimado/a <strong>${booking.guest.firstName} ${
      booking.guest.lastName
    }</strong>,</p>
        <p>Hemos recibido su solicitud de reserva. Nuestro personal de recepción se pondrá en contacto con usted 
           en breve para confirmar la disponibilidad y finalizar su reserva.</p>
      </div>
      
      <div style="border-left: 4px solid #4299e1; padding-left: 15px; margin-bottom: 20px;">
        <h2 style="color: #2b6cb0; font-size: 18px;">Detalles de su estadía</h2>
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 8px 0;">📅 <strong>Check-in:</strong> ${booking.checkInDate.toLocaleDateString()} (a partir de las 15:00)</li>
          <li style="margin: 8px 0;">📅 <strong>Check-out:</strong> ${booking.checkOutDate.toLocaleDateString()} (hasta las 12:00)</li>
          <li style="margin: 8px 0;">🌙 <strong>Duración:</strong> ${nights} noche${
      nights !== 1 ? "s" : ""
    }</li>
          <li style="margin: 8px 0;">👥 <strong>Huéspedes:</strong> ${
            booking.numberOfGuests
          }</li>
        </ul>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #2b6cb0; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Habitaciones reservadas</h2>
        <p style="font-size: 14px; color: #4a5568; font-style: italic;">Las habitaciones específicas serán asignadas al momento de su llegada según disponibilidad.</p>
        <ul style="list-style: none; padding: 0;">
          ${roomsList}
        </ul>
      </div>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2b6cb0; font-size: 18px; margin-top: 0;">Resumen de cargos</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;">Subtotal alojamiento:</td>
            <td style="text-align: right; padding: 8px 0;">$${subtotal.toFixed(
              2
            )}</td>
          </tr>
          ${
            tax > 0
              ? `
          <tr>
            <td style="padding: 8px 0;">Impuestos:</td>
            <td style="text-align: right; padding: 8px 0;">$${tax.toFixed(
              2
            )}</td>
          </tr>
          `
              : ""
          }
          <tr style="font-weight: bold; border-top: 1px solid #e2e8f0;">
            <td style="padding: 8px 0;">Total:</td>
            <td style="text-align: right; padding: 8px 0;">$${total.toFixed(
              2
            )}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 25px; background-color: #f0fff4; padding: 15px; border-radius: 8px;">
        <h2 style="color: #2b6cb0; font-size: 18px; margin-top: 0;">Información importante</h2>
        <ul style="padding-left: 20px;">
          <li style="margin-bottom: 5px;">El pago se realizará a su llegada.</li>
          <li style="margin-bottom: 5px;">Se requiere identificación oficial para todos los huéspedes adultos.</li>
          <li style="margin-bottom: 5px;">Si necesita modificar o cancelar su reserva, contáctenos con al menos 48 horas de anticipación.</li>
        </ul>
      </div>
      
      <p style="margin-top: 20px;">Si tiene alguna pregunta o necesita asistencia especial, no dude en contactarnos:</p>
      <p>📞 Teléfono: ${process.env.HOTEL_PHONE || "Teléfono no disponible"}</p>
      <p>📧 Email: ${process.env.HOTEL_EMAIL || process.env.SMTP_FROM_EMAIL}</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: booking.guest.email,
      subject: "Confirmación de Reserva - Hotel Oasis",
      html: emailTemplate(content),
    });
  },

  async sendStaffBookingNotification(booking: BookingWithRelations) {
    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

    // Group rooms by type and count them
    const roomsByType = booking.bookingRooms.reduce((acc, br) => {
      const roomType = br.room.type;
      if (!acc[roomType]) {
        acc[roomType] = {
          count: 0,
          price: 0,
          roomIds: [],
        };
      }
      acc[roomType].count += 1;
      acc[roomType].price = Number(br.priceAtTime);
      acc[roomType].roomIds.push(br.room.id);
      return acc;
    }, {} as Record<string, { count: number; price: number; roomIds: number[] }>);

    // Generate room list for staff with more detailed information
    const roomsList = Object.entries(roomsByType)
      .map(
        ([type, { count, price, roomIds }]) => `
      <li style="margin: 10px 0; padding: 10px; background-color: #f9fafb; border-radius: 4px;">
        <div style="font-weight: bold;">🏠 ${count} × Habitación ${type}</div>
        <div style="margin-left: 20px; font-size: 14px;">
          <div>Precio por noche: $${price.toFixed(2)}</div>
          <div>Subtotal por ${nights} noches: $${(price * nights).toFixed(
          2
        )}</div>
          <div style="color: #4a5568; font-size: 12px; margin-top: 5px;">
            IDs de habitaciones posibles: ${roomIds.join(", ")}
          </div>
        </div>
      </li>
    `
      )
      .join("");

    const content = `
      <h1 style="color: #2c5282; margin-bottom: 20px; text-align: center;">Nueva Solicitud de Reserva</h1>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
        <p style="color: #856404; font-weight: bold;">Se ha registrado una nueva solicitud de reserva que requiere confirmación.</p>
      </div>
      
      <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2b6cb0; font-size: 18px; margin-top: 0;">Información del huésped</h2>
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 8px 0;">👤 <strong>Nombre:</strong> ${
            booking.guest.firstName
          } ${booking.guest.lastName}</li>
          <li style="margin: 8px 0;">📧 <strong>Email:</strong> ${
            booking.guest.email
          }</li>
          <li style="margin: 8px 0;">📞 <strong>Teléfono:</strong> ${
            booking.guest.phoneNumber || "No proporcionado"
          }</li>
        </ul>
      </div>
      
      <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2b6cb0; font-size: 18px; margin-top: 0;">Detalles de la reserva</h2>
        <div style="display: flex; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <p>📅 <strong>Check-in:</strong> ${booking.checkInDate.toLocaleDateString()}</p>
            <p>📅 <strong>Check-out:</strong> ${booking.checkOutDate.toLocaleDateString()}</p>
            <p>🌙 <strong>Noches:</strong> ${nights}</p>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <p>👥 <strong>Huéspedes:</strong> ${booking.numberOfGuests}</p>
            <p>💰 <strong>Precio Total:</strong> $${Number(
              booking.totalPrice
            ).toFixed(2)}</p>
            <p>🔄 <strong>Estado:</strong> Pendiente de confirmación</p>
          </div>
        </div>
      </div>
      
      <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2b6cb0; font-size: 18px; margin-top: 0;">Habitaciones solicitadas</h2>
        <ul style="list-style: none; padding: 0;">
          ${roomsList}
        </ul>
      </div>
      
      
      <div style="background-color: #fed7d7; padding: 15px; border-radius: 8px; margin-top: 25px; border-left: 4px solid #e53e3e;">
        <p style="color: #c53030; font-weight: bold; margin: 0;">⚠️ Por favor, verificar la disponibilidad y contactar al huésped para confirmar la reserva lo antes posible.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.STAFF_EMAIL,
      subject: "Nueva Reserva Registrada - Requiere Confirmación",
      html: emailTemplate(content),
    });
  },
};
