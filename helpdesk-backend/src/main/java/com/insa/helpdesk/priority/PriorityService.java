package com.insa.helpdesk.priority;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Ticket Priority Management (FRD section 3.4).
 *
 * <p>Provides the supported priority levels (FR-020), calculates a priority from
 * impact + urgency using the configurable matrix (FR-021, FR-022), and exposes the
 * matrix for admin maintenance.</p>
 */
@Service
@RequiredArgsConstructor
public class PriorityService {

    private final PriorityMatrixConfigRepository matrixRepository;

    /**
     * FR-020: The supported priority levels, ordered most-to-least urgent.
     */
    public List<PriorityLevel> listPriorityLevels() {
        return Arrays.asList(PriorityLevel.values());
    }

    /**
     * FR-021 + FR-022: Calculate the resulting priority for a given impact and urgency
     * using the configured matrix. Falls back to the ITIL default if a cell is unset.
     */
    @Transactional(readOnly = true)
    public PriorityLevel calculatePriority(Impact impact, Urgency urgency) {
        return matrixRepository.findByImpactAndUrgency(impact, urgency)
                .map(PriorityMatrixConfig::getResultingPriority)
                .orElseGet(() -> defaultPriority(impact, urgency));
    }

    /**
     * FR-022: Return the full configured matrix in stable order (impact, then urgency).
     */
    @Transactional(readOnly = true)
    public List<PriorityMatrixConfig> getMatrix() {
        List<PriorityMatrixConfig> ordered = new ArrayList<>();
        for (Impact impact : Impact.values()) {
            for (Urgency urgency : Urgency.values()) {
                matrixRepository.findByImpactAndUrgency(impact, urgency)
                        .ifPresent(ordered::add);
            }
        }
        return ordered;
    }

    /**
     * FR-022: Replace the matrix with the provided configuration. Requires exactly one
     * row per (impact, urgency) combination. Callers must enforce authorization
     * (BR-004: only authorized users may change ticket priority).
     */
    @Transactional
    public void updateMatrix(List<PriorityMatrixDto.PriorityMatrixRow> rows) {
        Map<String, PriorityMatrixConfig> replacements = validateAndIndex(rows);
        matrixRepository.deleteAll();
        // Flush the delete before inserting so the unique constraint on (impact, urgency)
        // never sees both the old and new rows for the same combination in one transaction.
        matrixRepository.flush();
        replacements.values().forEach(matrixRepository::save);
    }

    /**
     * Find a single configured cell, for use by ticket creation/editing.
     */
    @Transactional(readOnly = true)
    public Optional<PriorityMatrixConfig> findRule(Impact impact, Urgency urgency) {
        return matrixRepository.findByImpactAndUrgency(impact, urgency);
    }

    private Map<String, PriorityMatrixConfig> validateAndIndex(List<PriorityMatrixDto.PriorityMatrixRow> rows) {
        if (rows == null) {
            throw new IllegalArgumentException("Matrix rows must not be null");
        }
        Map<String, PriorityMatrixConfig> byKey = new HashMap<>();
        for (PriorityMatrixDto.PriorityMatrixRow row : rows) {
            if (row.getImpact() == null || row.getUrgency() == null || row.getResultingPriority() == null) {
                throw new IllegalArgumentException("Each matrix row requires impact, urgency and resulting priority");
            }
            String key = key(row.getImpact(), row.getUrgency());
            if (byKey.put(key, PriorityMatrixConfig.builder()
                    .impact(row.getImpact())
                    .urgency(row.getUrgency())
                    .resultingPriority(row.getResultingPriority())
                    .build()) != null) {
                throw new IllegalArgumentException("Duplicate matrix row for " + key);
            }
        }
        for (Impact impact : Impact.values()) {
            for (Urgency urgency : Urgency.values()) {
                if (!byKey.containsKey(key(impact, urgency))) {
                    throw new IllegalArgumentException(
                            "Matrix must cover every combination; missing " + impact + "/" + urgency);
                }
            }
        }
        return byKey;
    }

    private static String key(Impact impact, Urgency urgency) {
        return impact + "/" + urgency;
    }

    /**
     * Built-in ITIL default used when a cell has not been configured.
     */
    private PriorityLevel defaultPriority(Impact impact, Urgency urgency) {
        if (impact == Impact.HIGH && urgency == Urgency.HIGH) {
            return PriorityLevel.CRITICAL;
        }
        if ((impact == Impact.HIGH && urgency == Urgency.MEDIUM)
                || (impact == Impact.MEDIUM && urgency == Urgency.HIGH)) {
            return PriorityLevel.HIGH;
        }
        if (impact == Impact.LOW && urgency == Urgency.LOW) {
            return PriorityLevel.LOW;
        }
        return PriorityLevel.MEDIUM;
    }
}
