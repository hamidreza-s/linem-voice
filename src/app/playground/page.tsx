'use client';

import { Theme, Container, Flex, Box, Text, Button, Card } from '@radix-ui/themes';
import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Phone, PhoneOff, PhoneCall } from 'lucide-react';
import Vapi from "@vapi-ai/web";

export default function Playground() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [vapi] = useState(() => new Vapi("aa08d2ca-16ef-499c-b921-6d130ac39436"));
  const assistantId = "fa4261ff-0490-4da6-bee7-fd8e1ec9b45b";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set up event listeners
    vapi.on("speech-start", () => {
      console.log("Assistant started speaking");
    });

    vapi.on("speech-end", () => {
      console.log("Assistant finished speaking");
    });

    vapi.on("message", (message) => {
      console.log("Received message:", message);
      
      if (message.type === "transcript" && message.transcriptType === "final") {
        const isUser = message.role === "user";
        setMessages(prev => [...prev, { text: message.transcript, isUser }]);
      } else if (message.type === "assistant-message") {
        console.log("Assistant message:", message);
        setMessages(prev => [...prev, { text: message.text, isUser: false }]);
      }
    });

    vapi.on("error", (error) => {
      console.error("Vapi error:", error);
    });

    return () => {
      vapi.stop();
    };
  }, [vapi]);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const call = await vapi.start(assistantId);
        console.log("Call started:", call);
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start call:", error);
      }
    } else {
      vapi.stop();
      setIsRecording(false);
    }
  };

  return (
    <Theme appearance="light" accentColor="blue" grayColor="slate" scaling="100%">
      <Container size="2" className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <Box className="sticky top-0 z-10 py-6 px-4 border-b border-gray-200 bg-white shadow-sm">
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">
              Groceries Assistant
            </Text>

            {/* Call in progress */}
            {isRecording && (
              <Flex align="center" gap="2" className="text-gray-400">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gray-200 animate-ping opacity-75"></div>
                  <Phone className="w-5 h-5 relative" />
                </div>
                <Text size="2" weight="medium">Call in progress</Text>
              </Flex>
            )}

            {/* Voice Input Area */}
            <Box>
              <Flex justify="center" align="center" direction="column" gap="2">
                <Button
                  size="3"
                  variant="solid"
                  color={isRecording ? "red" : "green"}
                  className={`w-16 h-16 rounded-full transition-all duration-200`}
                  onClick={toggleRecording}
                >
                  {isRecording ? (
                    <PhoneOff className="w-6 h-6 text-white" />
                  ) : (
                    <PhoneCall className="w-6 h-6 text-white" />
                  )}
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Messages Area */}
        <Box className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <Card key={index} className={`p-4 max-w-[80%] border-0 ${message.isUser
              ? 'ml-auto bg-green-200'
              : 'mr-auto bg-blue-200'
            }`}>
              <Text>
                {message.text}
              </Text>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </Container>
    </Theme>
  );
}
