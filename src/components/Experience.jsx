const TIMELINE = [
  {
    date: 'Oct 2023 — Present',
    role: 'Full-Stack Software Engineer (E2)',
    company: 'Ocado Technology · Hatfield',
    desc: 'Working on an event-driven purchase order recommendation system serving global retail partners (70m+ orders/year). Java/Spring Boot microservices on the backend; React on the front-end.\n\nNotable work: order splitting refactor, AWS infrastructure migration to Terraform, dynamic order breakdown UI, live constraint recalculations, tote-fill ordering algorithm, Renovate dependency ownership, Snyk security audits, 24/7 on-call rota.',
  },
  {
    date: 'June 2023 — Oct 2023',
    role: 'Recode Your Career — SWE Trainee',
    company: 'Ocado Technology',
    desc: "Selected for Ocado's competitive internal conversion scheme. Intensive full-stack training: React, TypeScript, Node.js, Git, databases, Agile, CI/CD.",
  },
  {
    date: 'Aug 2016 — June 2023',
    role: 'Sales & Capacity Planning',
    company: 'Ocado Logistics · Hatfield',
    desc: 'Progressed from Planner to Team Leader managing a team of four. Owned mid-term forecasting, national van-movement coordination, and built automation tooling in Google Apps Script and VBA.',
  },
  {
    date: 'July 2015 — Aug 2016',
    role: 'Internal Sales Engineer',
    company: 'Hamamatsu Photonics UK · Welwyn Garden City',
    desc: 'Sold opto-electronic components to UK universities and industry. Represented the business at national and international trade shows.',
  },
  {
    date: '2012 — 2015',
    role: 'BSc (Hons) Astrophysics — 2:1',
    company: 'University of Hertfordshire',
    desc: '',
  },
]

export default function Experience() {
  return (
    <>
      <div className="panel-tag">Sietch Tabr · Hidden Stronghold</div>
      <h1 className="panel-title">Experience</h1>
      <div className="timeline">
        {TIMELINE.map((item, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-date">{item.date}</div>
            <div className="timeline-role">{item.role}</div>
            <div className="timeline-company">{item.company}</div>
            {item.desc && (
              <div className="timeline-desc" style={{ whiteSpace: 'pre-line' }}>
                {item.desc}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
