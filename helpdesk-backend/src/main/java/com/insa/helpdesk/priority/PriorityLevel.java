package com.insa.helpdesk.priority;

/**
 * Priority levels supported by the system (FR-020).
 * Ordered from most to least urgent so a natural ordinal ordering works for comparisons.
 */
public enum PriorityLevel {
    CRITICAL, // System unavailable
    HIGH,     // Major business impact
    MEDIUM,   // Normal issue
    LOW       // Minor request
}
