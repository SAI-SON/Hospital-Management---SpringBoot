package com.medibook.email;

public interface EmailService {
    void sendVerificationEmail(String toEmail, String recipientName, String verificationToken);
    void sendPasswordResetEmail(String toEmail, String recipientName, String resetToken);
    void sendPasswordResetConfirmation(String toEmail, String recipientName);
    void sendBookingConfirmation(String toEmail, String patientName, String doctorName, String dateTime, String refNo);
    void sendDoctorNewBookingAlert(String toEmail, String doctorName, String patientName, String dateTime, String refNo);
    void sendAppointmentCancellation(String toEmail, String recipientName, String otherPartyName, String dateTime, String reason);
    void sendAppointmentReschedule(String toEmail, String recipientName, String otherPartyName, String newDateTime, String refNo);
    void sendAppointmentReminder(String toEmail, String patientName, String doctorName, String dateTime, String reminderType);
    void sendReviewRequest(String toEmail, String patientName, String doctorName, Long appointmentId);
}
