package com.medibook.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${medibook.app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${medibook.app.mail-sender:MediBook Hospital <no-reply@medibook.com>}")
    private String mailFrom;

    @Async
    @Override
    public void sendVerificationEmail(String toEmail, String recipientName, String verificationToken) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
        Context context = new Context();
        context.setVariable("name", recipientName);
        context.setVariable("actionUrl", verificationUrl);

        sendHtmlEmail(toEmail, "Verify Your MediBook Account", "email/verify-email", context);
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String toEmail, String recipientName, String resetToken) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
        Context context = new Context();
        context.setVariable("name", recipientName);
        context.setVariable("actionUrl", resetUrl);

        sendHtmlEmail(toEmail, "Reset Your MediBook Password", "email/reset-password", context);
    }

    @Async
    @Override
    public void sendPasswordResetConfirmation(String toEmail, String recipientName) {
        Context context = new Context();
        context.setVariable("name", recipientName);
        context.setVariable("actionUrl", frontendUrl + "/login");

        sendHtmlEmail(toEmail, "Your Password Has Been Changed", "email/password-changed", context);
    }

    @Async
    @Override
    public void sendBookingConfirmation(String toEmail, String patientName, String doctorName, String dateTime, String refNo) {
        Context context = new Context();
        context.setVariable("name", patientName);
        context.setVariable("doctorName", doctorName);
        context.setVariable("dateTime", dateTime);
        context.setVariable("referenceNo", refNo);
        context.setVariable("actionUrl", frontendUrl + "/patient/appointments");

        sendHtmlEmail(toEmail, "Appointment Confirmation - MediBook (" + refNo + ")", "email/booking-confirmation", context);
    }

    @Async
    @Override
    public void sendDoctorNewBookingAlert(String toEmail, String doctorName, String patientName, String dateTime, String refNo) {
        Context context = new Context();
        context.setVariable("doctorName", doctorName);
        context.setVariable("patientName", patientName);
        context.setVariable("dateTime", dateTime);
        context.setVariable("referenceNo", refNo);
        context.setVariable("actionUrl", frontendUrl + "/doctor/dashboard");

        sendHtmlEmail(toEmail, "New Appointment Booking Alert (" + refNo + ")", "email/doctor-booking-alert", context);
    }

    @Async
    @Override
    public void sendAppointmentCancellation(String toEmail, String recipientName, String otherPartyName, String dateTime, String reason) {
        Context context = new Context();
        context.setVariable("name", recipientName);
        context.setVariable("otherPartyName", otherPartyName);
        context.setVariable("dateTime", dateTime);
        context.setVariable("reason", reason);
        context.setVariable("actionUrl", frontendUrl);

        sendHtmlEmail(toEmail, "Appointment Cancellation Notice", "email/cancellation-notice", context);
    }

    @Async
    @Override
    public void sendAppointmentReschedule(String toEmail, String recipientName, String otherPartyName, String newDateTime, String refNo) {
        Context context = new Context();
        context.setVariable("name", recipientName);
        context.setVariable("otherPartyName", otherPartyName);
        context.setVariable("newDateTime", newDateTime);
        context.setVariable("referenceNo", refNo);
        context.setVariable("actionUrl", frontendUrl);

        sendHtmlEmail(toEmail, "Appointment Rescheduled (" + refNo + ")", "email/reschedule-notice", context);
    }

    @Async
    @Override
    public void sendAppointmentReminder(String toEmail, String patientName, String doctorName, String dateTime, String reminderType) {
        Context context = new Context();
        context.setVariable("name", patientName);
        context.setVariable("doctorName", doctorName);
        context.setVariable("dateTime", dateTime);
        context.setVariable("reminderType", reminderType);
        context.setVariable("actionUrl", frontendUrl + "/patient/appointments");

        sendHtmlEmail(toEmail, "Reminder: Upcoming Appointment with " + doctorName, "email/appointment-reminder", context);
    }

    @Async
    @Override
    public void sendReviewRequest(String toEmail, String patientName, String doctorName, Long appointmentId) {
        Context context = new Context();
        context.setVariable("name", patientName);
        context.setVariable("doctorName", doctorName);
        context.setVariable("actionUrl", frontendUrl + "/patient/appointments?review=" + appointmentId);

        sendHtmlEmail(toEmail, "How Was Your Visit with " + doctorName + "?", "email/review-request", context);
    }

    private void sendHtmlEmail(String toEmail, String subject, String templateName, Context context) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            String htmlBody = templateEngine.process(templateName, context);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);
            log.info("Email successfully dispatched to {} with subject: {}", toEmail, subject);
        } catch (Exception ex) {
            log.warn("Failed to send email to {} (dev mail server may be offline): {}", toEmail, ex.getMessage());
        }
    }
}
