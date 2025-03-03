# AI Agent Orchestra

A collaborative multi-agent system for complex problem solving. This system orchestrates multiple specialized AI agents, each with distinct capabilities and knowledge domains, to work together on tasks that would be challenging for a single AI system.

## Key Components

1. **Agent Framework** - Specialized AI agents with different roles and expertise
2. **Orchestration Layer** - Coordination between agents, problem decomposition, and solution synthesis
3. **Memory Management** - Shared context and history across agent interactions
4. **User Interface** - Modern web interface with task management and agent visualization
5. **Authentication System** - Secure user authentication and authorization

## Technical Stack

- Node.js and Express for backend infrastructure
- Gemini API for LLM capabilities (with mock response fallback)
- MongoDB for persistent storage (with in-memory fallback)
- JWT for authentication
- Modern HTML/CSS/JS frontend

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, the system can run with in-memory storage)
- Gemini API key (optional, the system can run with mock responses)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/ai-agent-orchestra.git
cd ai-agent-orchestra
```

2. Install dependencies
```
npm install
```

3. Configure environment variables
```
cp .env.example .env
```
Edit the `.env` file with your API keys and configuration.

4. Start the development server
```
npm run dev
```

## Usage

1. **Register/Login**: Create an account or log in to an existing account
2. **Create a Task**: Describe the task you want the AI agents to work on
3. **Monitor Progress**: Watch as the agents collaborate to complete the task
4. **View Results**: See the final output and the steps taken by each agent

Once the server is running, you can interact with the AI Agent Orchestra through:

- Web interface at `http://localhost:3000`
- REST API at `http://localhost:3000/api`

## Agent Types

- **Research Agent**: Gathers and analyzes information from various sources
- **Planning Agent**: Breaks down complex tasks into manageable steps
- **Creative Agent**: Generates innovative ideas and solutions
- **Critic Agent**: Evaluates solutions and identifies potential issues
- **Execution Agent**: Implements solutions and executes tasks
- **Data Analysis Agent**: Analyzes data and extracts meaningful insights
- **Content Writing Agent**: Creates high-quality written content
- **Summarization Agent**: Condenses large amounts of information into concise summaries
- **Code Assistant Agent**: Writes, reviews, and optimizes code
- **Translation Agent**: Translates content between different languages

## Project Structure

```
├── dist/                # Frontend static files
├── src/                 # Source code
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   └── services/        # Service layer
├── simple-server.js     # Main server file
├── package.json         # Project dependencies
└── .env                 # Environment variables
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
