package com.insa.helpdesk.priority;

/**
 * Urgency of a ticket: how quickly a resolution is required.
 * Based on FR-021 (priority is calculated from impact and urgency).
 */
public enum Urgency {
    HIGH,   // Business is currently affected
    MEDIUM, // Will be affected soon
    LOW     // No immediate impact
}
