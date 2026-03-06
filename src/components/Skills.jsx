const LANGUAGES = ['Java', 'TypeScript', 'JavaScript', 'SQL']
const FRAMEWORKS = ['Spring Boot', 'React', 'Node.js', 'Express']
const TOOLS = [
  'Terraform', 'AWS (SNS/SQS/DynamoDB/Kinesis)', 'GitLab CI', 'Git',
  'Grafana', 'Maven', 'Jest', 'Snyk', 'SonarQube', 'BigQuery', 'Vite', 'npm',
]

export default function Skills() {
  return (
    <>
      <div className="panel-tag">Deep Desert · Spice Fields</div>
      <h1 className="panel-title">Technical Arsenal</h1>

      <h2 className="section-title">Languages</h2>
      <div className="skills-grid">
        {LANGUAGES.map(s => <div key={s} className="skill-tag highlight">{s}</div>)}
      </div>

      <h2 className="section-title">Frameworks</h2>
      <div className="skills-grid">
        {FRAMEWORKS.map(s => <div key={s} className="skill-tag highlight">{s}</div>)}
      </div>

      <h2 className="section-title">Tools & DevOps</h2>
      <div className="skills-grid">
        {TOOLS.map(s => <div key={s} className="skill-tag">{s}</div>)}
      </div>
    </>
  )
}
