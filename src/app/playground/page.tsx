'use client';

import { Theme, Container, Flex, Box, Text, Button, Card } from '@radix-ui/themes';
import { useState } from 'react';
import { Mic, Square } from 'lucide-react';

export default function Playground() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello! How can I help you today?", isUser: false }
  ]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <Theme appearance="light" accentColor="blue" grayColor="slate" scaling="100%">
      <Container size="2" className="h-screen flex flex-col">
        {/* Header */}
        <Box className="py-4 px-4">
          <Text size="5" weight="bold" className="text-center">
            Voice Assistant
          </Text>
        </Box>

        {/* Chat Area */}
        <Box className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <Flex
              key={index}
              justify={message.isUser ? "end" : "start"}
              className="w-full"
            >
              <Card
                className={`max-w-[80%] p-3 ${message.isUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                  }`}
              >
                <Text size="2">{message.text}</Text>
              </Card>
            </Flex>
          ))}
        </Box>

        {/* Voice Input Area */}
        <Box className="p-4 bg-white">
          <Flex justify="start" align="center" className="gap-4">
            <Button
              size="3"
              variant="solid"
              className={`w-16 h-16 rounded-full ${isRecording ? "bg-red-500" : "bg-blue-500"
                }`}
              onClick={toggleRecording}
            >
              {isRecording ? (
                <Square className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </Button>
            <Text size="1" className="text-center mt-2 text-gray-500">
              {isRecording ? "Tap to stop" : "Tap to speak"}
            </Text>
          </Flex>
        </Box>
      </Container>
    </Theme>
  );
}
