// __mocks__/openaiClient.ts
import { ChatCompletion, ChatCompletionCreateParams } from "openai/resources";
import { Stream } from "openai/streaming";

const mockCompletionsCreate = async (
    params: ChatCompletionCreateParams
): Promise<
    ChatCompletion | Stream<ChatCompletion> // Assuming Stream might be needed someday
> => {
    const content = params.messages[0]?.content?.toString() || "";

    // Simple mock logic based on query content
    if (content.includes("yoga")) {
        return {
            id: "mock-yoga-123",
            object: "chat.completion",
            created: Date.now(),
            model: params.model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: JSON.stringify([1, 2, 4, 5, 10]),
                    },
                    finish_reason: "stop",
                },
            ],
        } as ChatCompletion;
    }
    if (content.includes("music")) {
        return {
            id: "mock-music-123",
            object: "chat.completion",
            created: Date.now(),
            model: params.model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: JSON.stringify([3, 8]),
                    },
                    finish_reason: "stop",
                },
            ],
        } as ChatCompletion;
    }
    if (content.includes("meditation")) {
        return {
            id: "mock-meditation-123",
            object: "chat.completion",
            created: Date.now(),
            model: params.model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: JSON.stringify([2, 6, 9]),
                    },
                    finish_reason: "stop",
                },
            ],
        } as ChatCompletion;
    }
    if (content.includes("Beat Town Hall")) {
        return {
            id: "mock-beat-town-hall-123",
            object: "chat.completion",
            created: Date.now(),
            model: params.model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: JSON.stringify([3, 8]),
                    },
                    finish_reason: "stop",
                },
            ],
        } as ChatCompletion;
    }
    if (content.includes("Central Park")) {
        return {
            id: "mock-central-park-123",
            object: "chat.completion",
            created: Date.now(),
            model: params.model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: JSON.stringify([7, 10]),
                    },
                    finish_reason: "stop",
                },
            ],
        } as ChatCompletion;
    }
    if (content.includes("foo")) {
        return {
            id: "mock-foo-123",
            object: "chat.completion",
            created: Date.now(),
            model: params.model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: "[]", // Empty array for no match
                    },
                    finish_reason: "stop",
                },
            ],
        } as ChatCompletion;
    }

    // Default mock response if no specific query matched
    return {
        id: "mock-default-123",
        object: "chat.completion",
        created: Date.now(),
        model: params.model,
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: "[]", // Default to empty array
                },
                finish_reason: "stop",
            },
        ],
    } as ChatCompletion;
};

// Mock the entire OpenAI client structure needed by search.ts
const mockOpenaiClient = {
    chat: {
        completions: {
            create: mockCompletionsCreate,
        },
    },
};

export default mockOpenaiClient;
