package com.insa.helpdesk.priority;

/**
 * Impact of a ticket: how many users / how much of the business is affected.
 * Based on FR-021 (priority is calculated from impact and urgency).
 */
public enum Impact {
    HIGH,   // Entire organization
    MEDIUM, // A department
    LOW     // A single user
}
