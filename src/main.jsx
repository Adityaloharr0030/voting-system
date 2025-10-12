import React from 'react'
import { createRoot } from 'react-dom/client'
import VotingApp from './VotingApp'
// Load project-level stylesheet from the project root so Vite serves it correctly
import '/stl.css'

const root = createRoot(document.getElementById('root'))
root.render(<VotingApp />)
