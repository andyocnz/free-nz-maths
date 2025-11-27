import { useState } from 'react'
import { number_to_words } from './mathHelpers.js'

const WORDS = [
  "zero","one","two","three","four","five","six","seven","eight","nine",
  "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
  "seventeen","eighteen","nineteen","twenty","thirty","forty","fifty",
  "sixty","seventy","eighty","ninety","hundred","thousand","and"
]

export default function WordDropdown({ number, onAnswer }) {
  const [typed, setTyped] = useState('')
  const [selected, setSelected] = useState('')

  const correct = number_to_words(number)
  const options = WORDS.filter(w => w.includes(typed.toLowerCase())).slice(0,8)

  const submit = () => {
    if (selected) {
      onAnswer(selected)
    }
  }

  return (
    <div style={{fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto'}}>
      <input
        value={typed}
        onChange={e => setTyped(e.target.value)}
        placeholder="Type to filter words (e.g. two, hundred)..."
        style={{width:'100%', padding:'16px', fontSize:'18px', borderRadius:'8px', border:'2px solid #1976d2', marginBottom:'12px'}}
        autoFocus
      />
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:'10px', marginBottom:'20px'}}>
        {options.map(word => (
          <button
            key={word}
            onClick={() => {
              setSelected(prev => prev ? prev + ' ' + word : word)
              setTyped('')
            }}
            style={{
              padding:'12px 8px',
              background:'#e3f2fd',
              border:'1px solid #1976d2',
              borderRadius:'8px',
              cursor:'pointer',
              fontSize:'15px',
              fontWeight:'600',
              transition:'all 0.2s'
            }}
            onMouseOver={e => e.target.style.background = '#bbdefb'}
            onMouseOut={e => e.target.style.background = '#e3f2fd'}
          >
            {word}
          </button>
        ))}
      </div>
      <div style={{
        fontSize:'20px',
        fontWeight:'bold',
        color:'#1976d2',
        marginBottom:'20px',
        padding:'16px',
        background:'#f0f8ff',
        borderRadius:'8px',
        minHeight:'60px',
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
      }}>
        {selected || 'Click words above to build your answer...'}
      </div>
      <div style={{display:'flex', gap:'12px', justifyContent:'center'}}>
        <button
          onClick={() => setSelected('')}
          style={{
            padding:'14px 24px',
            fontSize:'16px',
            background:'#f44336',
            color:'white',
            border:'none',
            borderRadius:'8px',
            cursor:'pointer',
            fontWeight:'600'
          }}
        >
          Clear
        </button>
        <button
          onClick={submit}
          disabled={!selected}
          style={{
            padding:'14px 32px',
            fontSize:'16px',
            background: selected ? '#1976d2' : '#ccc',
            color:'white',
            border:'none',
            borderRadius:'8px',
            cursor: selected ? 'pointer' : 'not-allowed',
            fontWeight:'600'
          }}
        >
          Submit Answer
        </button>
      </div>
    </div>
  )
}
