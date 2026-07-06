import { CanvasElement, ElementType, Position } from '../types/canvas';
import { createElement } from './canvas-service';

interface ParsedCommand {
  action: 'add' | 'move' | 'delete' | 'edit';
  type?: ElementType;
  content?: string;
  position?: Position;
}

function parseCommand(input: string): ParsedCommand | null {
  const lowerInput = input.toLowerCase();

  // Text commands
  if (lowerInput.includes('title') || lowerInput.includes('text')) {
    const contentMatch = input.match(/(?:saying|with text|text)[:\s]+["']?([^"']+)["']?/i);
    return {
      action: 'add',
      type: 'text',
      content: contentMatch?.[1]?.trim() || 'New Text',
      position: { x: 150, y: 100 },
    };
  }

  // Image commands
  if (lowerInput.includes('image') || lowerInput.includes('picture') || lowerInput.includes('photo')) {
    const posMatch = lowerInput.match(/(?:at|in)\s+(?:position\s+)?(\d+)[,\s]+(\d+)/);
    return {
      action: 'add',
      type: 'image',
      position: posMatch
        ? { x: parseInt(posMatch[1]), y: parseInt(posMatch[2]) }
        : { x: 100, y: 100 },
    };
  }

  // Shape commands
  if (lowerInput.includes('shape') || lowerInput.includes('rectangle') || lowerInput.includes('box')) {
    return {
      action: 'add',
      type: 'shape',
      position: { x: 150, y: 150 },
    };
  }

  return null;
}

export function processAICommand(input: string): {
  response: string;
  elements?: CanvasElement[];
} {
  const command = parseCommand(input);

  if (!command) {
    return {
      response: "I'm not sure what you mean. Try commands like:\n• \"add a title saying Hello\"\n• \"place an image in the center\"\n• \"add a rectangle shape\"",
    };
  }

  if (command.action === 'add' && command.type) {
    const element = createElement(
      command.type,
      command.position || { x: 150, y: 150 }
    );

    if (command.content) {
      element.content = command.content;
    }

    const typeNames: Record<ElementType, string> = {
      text: 'text block',
      image: 'image',
      shape: 'shape',
      group: 'group',
    };

    return {
      response: `Added a ${typeNames[command.type]}${command.content ? ` with text "${command.content}"` : ''}.`,
      elements: [element],
    };
  }

  return {
    response: "I understood your request but can't perform that action yet.",
  };
}
