# Rootstock Yield Insight Agent

An AI-powered chatbot that provides insights and analysis about yield opportunities on the Rootstock blockchain. This application uses the DeFiLlama API to fetch real-time data and DeepSeek AI to provide natural language interactions.

## Features

- 🤖 **AI-Powered Analysis**: Ask questions about Rootstock yield opportunities in natural language
- 📊 **Real-time Data**: Fetches up-to-date yield data from DeFiLlama API
- 📈 **Comprehensive Insights**: Compare APY, TVL, risk levels, and more across protocols
- 🔍 **Intelligent Search**: Find specific protocols or filter by various criteria
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Data Caching**: Efficient data management with 15-minute cache refresh

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **AI**: DeepSeek AI via AI SDK
- **Data**: DeFiLlama API
- **RAG System**: Custom vector store implementation for efficient retrieval
- **Styling**: Tailwind CSS with custom dark theme

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- DeepSeek API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chandrapratamar/rootstock-yield-insight-agent.git
   cd rootstock-yield-insight-agent
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your DeepSeek API key:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Asking Questions

You can ask the Rootstock Yield Insight Agent various questions about yield opportunities on Rootstock, such as:

- "Which protocol has the highest APY on Rootstock?"
- "Compare yield opportunities on Rootstock"
- "What are the lowest risk yield opportunities on Rootstock?"
- "Tell me about the TVL distribution across Rootstock protocols"
- "Which protocols have the most stable yields?"

### Refreshing Data

Click the "Refresh Data" button in the top-right corner to fetch the latest data from DeFiLlama.

## API Endpoints

The application includes several API endpoints:

- `POST /api/chat`: Main chat endpoint that processes user queries
- `GET /api/init-vector-store`: Initializes the vector store with Rootstock data
- `GET /api/debug-data`: Returns debug information about the current data
- `GET /api/check-deepseek`: Checks if the DeepSeek API is configured correctly

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/             # React components
│   ├── chatbot.tsx         # Main chatbot component
│   ├── info-panel.tsx      # Information panel
│   ├── ui/                 # UI components
│   └── ...
├── lib/                    # Utility functions and services
│   ├── data-service.ts     # DeFiLlama data fetching
│   ├── knowledge-store.ts  # RAG knowledge store
│   ├── prompt-builder.ts   # AI prompt construction
│   ├── vector-store.ts     # Vector storage for RAG
│   └── ...
└── public/                 # Static assets
```

## How It Works

1. **Data Fetching**: The application fetches yield data from DeFiLlama API, focusing on Rootstock protocols.
2. **Knowledge Processing**: The data is processed and stored in a vector store for efficient retrieval.
3. **Query Processing**: When a user asks a question, the system:
   - Analyzes the query
   - Retrieves relevant context from the vector store
   - Constructs an optimized prompt for the AI
   - Streams the AI's response back to the user

## Future Improvements

- [ ] Add risk assessment visualization
- [ ] Implement protocol comparison feature
- [ ] Add more Rootstock protocols and pools data 
- [ ] Implement robust error handling
- [ ] Add protocol details 

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [DeFiLlama](https://defillama.com/) for providing the yield data API
- [DeepSeek AI](https://deepseek.ai/) for the AI capabilities
- [Vercel](https://vercel.com/) for hosting and deployment
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
