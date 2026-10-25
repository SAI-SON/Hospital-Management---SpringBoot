package com.medibook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String email;
    private String role;
    private String status;
    private String fullName;
    private Long profileId;
    private String avatarUrl;
}
