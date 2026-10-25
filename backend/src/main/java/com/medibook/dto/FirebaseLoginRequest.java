package com.medibook.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirebaseLoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String fullName;
    private String photoUrl;
    private String firebaseUid;
    private String phoneNumber;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String emergencyContact;
    private String address;
}
