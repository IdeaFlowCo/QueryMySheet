import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { runSearch } from "./search";
import mockOpenAIClient from "../openaiClient"; // Automatically uses the __mocks__/openaiClient.ts

// Cast to access the reset method
const mockClient = mockOpenAIClient as typeof mockOpenAIClient & {
    reset: () => void;
};

// Define a simple type for the expected call arguments
interface ExpectedCallArgs {
    messages: { role: string; content: string }[];
    model: string;
}

const headers = ["Event Name", "Location/Details"];
const rows = [
    /* 1 */ ["yoga class", "Burn Loop Center"],
    /* 2 */ ["meditation session", "Yoga Bliss Studio"],
    /* 3 */ ["live music event", "Beat Town Hall"],
    /* 4 */ ["Weekend Yoga Retreat", "Happy Soul Resort"],
    /* 5 */ ["Advanced Yoga Workshop", "Burn Loop Center"],
    /* 6 */ ["Sound Bath Meditation", "Yoga Bliss Studio"],
    /* 7 */ ["Community Picnic", "Central Park"],
    /* 8 */ ["Rock Concert", "Beat Town Hall"],
    /* 9 */ ["Intro to Meditation", "Online"],
    /* 10 */ ["Morning Yoga Flow", "Central Park"],
];

describe("runSearch", () => {
    beforeEach(() => {
        // Reset the mock before each test
        mockClient.reset();
    });

    it("returns all rows when query is empty", async () => {
        const result = await runSearch("", headers, rows);
        expect(result).toEqual(rows);
        // Ensure the mock client was not called for empty query
        expect(mockClient.chat.completions.create).not.toHaveBeenCalled();
    });

    it("filters for 'yoga' (mock indices [1, 2, 4, 5, 10])", async () => {
        const result = await runSearch("yoga", headers, rows);
        expect(result).toEqual([
            rows[0], // 1
            rows[1], // 2
            rows[3], // 4
            rows[4], // 5
            rows[9], // 10
        ]);
        // Ensure the mock client was called once
        expect(mockClient.chat.completions.create).toHaveBeenCalledTimes(1);
        // Optional: Check the prompt sent to the mock
        const calls = (mockClient.chat.completions.create as jest.Mock).mock
            .calls;
        // Assert the type of the first argument of the first call
        const firstCallArgs = calls[0][0] as ExpectedCallArgs;
        expect(firstCallArgs.messages[0].content).toContain(
            "Query: find me events related to 'yoga'."
        );
    });

    it("returns empty array for 'foo' (mock index [])", async () => {
        const result = await runSearch("foo", headers, rows);
        expect(result).toEqual([]);
        // Ensure the mock client was called once
        expect(mockClient.chat.completions.create).toHaveBeenCalledTimes(1);
        const calls = (mockClient.chat.completions.create as jest.Mock).mock
            .calls;
        // Assert the type of the first argument of the first call
        const firstCallArgs = calls[0][0] as ExpectedCallArgs;
        expect(firstCallArgs.messages[0].content).toContain(
            "Query: find me events related to 'foo'."
        );
    });

    it("filters for 'music' (mock index [3, 8])", async () => {
        const result = await runSearch("music", headers, rows);
        expect(result).toEqual([
            rows[2], // 3
            rows[7], // 8
        ]);
        expect(mockClient.chat.completions.create).toHaveBeenCalledTimes(1);
        const calls = (mockClient.chat.completions.create as jest.Mock).mock
            .calls;
        // Assert the type of the first argument of the first call
        const firstCallArgs = calls[0][0] as ExpectedCallArgs;
        expect(firstCallArgs.messages[0].content).toContain(
            "Query: find me events related to 'music'."
        );
    });

    it("filters for 'meditation' (mock indices [2, 6, 9])", async () => {
        const result = await runSearch("meditation", headers, rows);
        expect(result).toEqual([
            rows[1], // 2
            rows[5], // 6
            rows[8], // 9
        ]);
        expect(mockClient.chat.completions.create).toHaveBeenCalledTimes(1);
        const calls = (mockClient.chat.completions.create as jest.Mock).mock
            .calls;
        const firstCallArgs = calls[0][0] as ExpectedCallArgs;
        expect(firstCallArgs.messages[0].content).toContain(
            "Query: find me events related to 'meditation'."
        );
    });

    it("filters for events at 'Beat Town Hall' (mock indices [3, 8])", async () => {
        const result = await runSearch("Beat Town Hall", headers, rows);
        expect(result).toEqual([
            rows[2], // 3
            rows[7], // 8
        ]);
        expect(mockClient.chat.completions.create).toHaveBeenCalledTimes(1);
        const calls = (mockClient.chat.completions.create as jest.Mock).mock
            .calls;
        const firstCallArgs = calls[0][0] as ExpectedCallArgs;
        expect(firstCallArgs.messages[0].content).toContain(
            "Query: find me events related to 'Beat Town Hall'."
        );
    });

    it("filters for events in 'Central Park' (mock indices [7, 10])", async () => {
        const result = await runSearch("Central Park", headers, rows);
        expect(result).toEqual([
            rows[6], // 7
            rows[9], // 10
        ]);
        expect(mockClient.chat.completions.create).toHaveBeenCalledTimes(1);
        const calls = (mockClient.chat.completions.create as jest.Mock).mock
            .calls;
        const firstCallArgs = calls[0][0] as ExpectedCallArgs;
        expect(firstCallArgs.messages[0].content).toContain(
            "Query: find me events related to 'Central Park'."
        );
    });
});
