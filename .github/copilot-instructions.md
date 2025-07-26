# InnerVoice Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
InnerVoice is a personal note-taking application with AI-powered emotional analysis and insights. The application helps users capture their thoughts and receive intelligent feedback about their emotional state and personal growth.

## Tech Stack
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, App Router
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3 (for local development)
- **AI Integration**: OpenAI API for text analysis and insights
- **Styling**: Tailwind CSS with custom components

## Code Guidelines
- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement responsive design patterns
- Use React Server Components where appropriate
- Keep components small and focused
- Add proper error handling and loading states

## Key Features to Implement
1. **Note Creation**: Simple text input for user notes
2. **AI Analysis**: Automatic emotional tone analysis and insights
3. **Note Expansion**: AI expands short notes with context and suggestions
4. **Mood Tracking**: Track emotional patterns over time
5. **Personal Growth**: Provide constructive feedback and reflection prompts
6. **Data Persistence**: Save notes and analysis results locally

## File Structure
- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and database setup
- `/src/types` - TypeScript type definitions
- `/src/styles` - Global styles and Tailwind config

## AI Integration Notes
- Use environment variables for API keys
- Implement proper error handling for AI service calls
- Consider rate limiting and cost optimization
- Provide fallbacks when AI services are unavailable
