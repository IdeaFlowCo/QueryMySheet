import { describe, it, expect, jest } from "@jest/globals";
import { runSearch } from "./search"; // Imports the real function

// These tests require a valid VITE_OPENAI_API_KEY in the environment
// They will make actual calls to the OpenAI API and may incur costs.

// --- More Complex Test Data --- //
const complexHeaders = [
    "Event",
    "Date",
    "Time",
    "Category",
    "Location",
    "Notes",
];
const complexRows = [
    /* 1 */ [
        "Team Lunch",
        "2025-05-10",
        "12:00 PM",
        "Work",
        "Company Cafeteria",
        "Mandatory attendance",
    ],
    /* 2 */ [
        "Client Meeting",
        "2025-05-10",
        "2:00 PM",
        "Work",
        "Conference Room B",
        "Discuss Q3 proposal",
    ],
    /* 3 */ [
        "Yoga Class",
        "2025-05-11",
        "6:00 PM",
        "Wellness",
        "Studio A",
        "Bring mat",
    ],
    /* 4 */ [
        "Project Deadline",
        "2025-05-15",
        "5:00 PM",
        "Work",
        "N/A",
        "Submit final report via email",
    ],
    /* 5 */ [
        "Book Club",
        "2025-05-15",
        "7:00 PM",
        "Social",
        "Library Reading Room",
        "Reading 'The Silent Patient'",
    ],
    /* 6 */ [
        "Meditation Workshop",
        "2025-05-18",
        "10:00 AM",
        "Wellness",
        "Studio A",
        "Focus on mindfulness",
    ],
    /* 7 */ [
        "Town Hall Meeting",
        "2025-05-20",
        "9:00 AM",
        "Work",
        "Auditorium",
        "Company updates",
    ],
    /* 8 */ [
        "Weekend Yoga Retreat",
        "2025-05-24",
        "Full Day",
        "Wellness",
        "Mountain Resort",
        "Register by 5/15",
    ],
    /* 9 */ [
        "Team Building Activity",
        "2025-05-28",
        "1:00 PM",
        "Work",
        "Outdoor Park",
        "Casual dress code",
    ],
    /* 10 */ [
        "Client Dinner",
        "2025-05-28",
        "7:00 PM",
        "Work",
        "Downtown Restaurant",
        "Confirm attendees",
    ],
];

// Increase timeout for API calls - maybe more needed for complex queries?
jest.setTimeout(60000); // 60 seconds

describe("runSearch (Complex Integration)", () => {
    it("should return an empty array for an irrelevant query like 'xyz123'", async () => {
        const query = "xyz123 non existent term";
        const result = await runSearch(query, complexHeaders, complexRows);
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeLessThanOrEqual(1); // Should be 0 or maybe 1 hallucination
    });

    it("should find work events on May 10th", async () => {
        const query = "work events on May 10th";
        const result = await runSearch(query, complexHeaders, complexRows);
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(2); // Expecting Team Lunch & Client Meeting
        result.forEach((row) => {
            expect(row[3]?.toLowerCase()).toBe("work"); // Check Category is Work
            expect(row[1]).toBe("2025-05-10"); // Check Date is 2025-05-10
        });
    });

    it("should find wellness activities", async () => {
        const query = "wellness activities";
        const result = await runSearch(query, complexHeaders, complexRows);
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(3); // Expecting Yoga Class, Meditation Workshop, Yoga Retreat
        result.forEach((row) => {
            expect(row[3]?.toLowerCase()).toBe("wellness"); // Check Category is Wellness
        });
    });

    it("should find when the project deadline is", async () => {
        const query = "When is the project deadline?";
        const result = await runSearch(query, complexHeaders, complexRows);
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1); // Expecting Project Deadline row
        // Check if the results contain the relevant info
        expect(
            result.some((row) =>
                row[0]?.toLowerCase().includes("project deadline")
            )
        ).toBe(true);
    });

    it("should find meetings after 1 PM on May 10th", async () => {
        const query = "Meetings after 1 PM on May 10th";
        const result = await runSearch(query, complexHeaders, complexRows);
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1); // Expecting Client Meeting
        result.forEach((row) => {
            expect(row[1]).toBe("2025-05-10"); // Check Date
            expect(row[0]?.toLowerCase()).toContain("meeting"); // Check Event
            // Basic check for time being 2:00 PM or later (assumes consistent format)
            const time = row[2];
            expect(time && parseInt(time.split(":")[0]) >= 2).toBe(true);
        });
    });

    it("should find events at Studio A", async () => {
        const query = "events at Studio A";
        const result = await runSearch(query, complexHeaders, complexRows);
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(2); // Expecting Yoga Class, Meditation Workshop
        result.forEach((row) => {
            expect(row[4]).toBe("Studio A"); // Check Location
        });
    });
});
