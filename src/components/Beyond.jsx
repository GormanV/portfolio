const HOBBIES = [
  {
    icon: '🏃',
    name: 'Running',
    desc: 'I run regularly with my partner and have completed two half-marathons so far.',
  },
  {
    icon: '🃏',
    name: 'Dominion',
    desc: "My favourite card game. Dominion is a deck-builder where every game plays differently depending on which kingdom cards are in play — there's a lot of strategic depth and it rewards forward planning. I play regularly with a social group alongside other board and tabletop games.",
  },
  {
    icon: '📖',
    name: 'Dune — Frank Herbert',
    desc: "I've read the original series multiple times. Herbert built an incredibly detailed universe — the ecology, politics, religion and economics all feel genuinely interconnected. The later books get strange but I enjoy them for it. Still haven't found anything quite like it.",
  },
  {
    icon: '⚔️',
    name: 'Old School RuneScape',
    desc: "My favourite MMO and a long-standing hobby. OSRS has a particular charm — it's deliberately old-fashioned, the grind is real, and the community votes on every major update. I enjoy the goal-setting side of it as much as anything; there's always something to work towards, whether that's a skill, a quest, or a boss.",
  },
]

export default function Beyond() {
  return (
    <>
      <div className="panel-tag">Polar Sink · The Outer Reaches</div>
      <h1 className="panel-title">Beyond the Code</h1>
      <div className="hobby-cards">
        {HOBBIES.map((h, i) => (
          <div key={i} className="hobby-card">
            <div className="hobby-card-header">
              <span className="hobby-icon">{h.icon}</span>
              <span className="hobby-name">{h.name}</span>
            </div>
            <p>{h.desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}
