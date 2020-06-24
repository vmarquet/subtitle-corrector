import React from 'react';
import logo from './logo.svg';
import './App.css';


type State = {
  lines: Array<Line>,
}
type Line = {
  id: string
  startTime: number
  endTime: number
  text: string
}

export default class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)

    this.state = {
      lines: []
    }
  }


  importSrt = (file: File) => {
    const reader = new FileReader()
    reader.readAsText(file)

    reader.onload = (e) => {
      if (!e.target) return

      var text = e.target.result as string
      
      text = text.replace(/\r/g, '')
      const regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g
      const text2 = text.split(regex)
      text2.shift()

      const lines = []

      for (let i = 0; i < text2.length; i += 4) {
        lines.push({
          id: text2[i].trim(),
          startTime: this.timeMs(text2[i + 1].trim()),
          endTime: this.timeMs(text2[i + 2].trim()),
          text: text2[i + 3].trim()
        })
      }

      this.setState({ lines: lines })
    }
  }

  timeMs = (val: string): number => {
    const regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/
    const parts = regex.exec(val)

    if (parts == null)
      return 0

    for (var i = 1; i < 5; i++) {
      // @ts-ignore
      parts[i] = parseInt(parts[i], 10)

      // @ts-ignore
      if (isNaN(parts[i]))
        // @ts-ignore
        parts[i] = 0
    }

    // hours + minutes + seconds + ms
    // @ts-ignore
    return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4]
  }

  displayTimestamp = (ms: number): string => {
    const total_seconds = Math.floor(ms / 1000)
    const total_minutes = Math.floor(total_seconds / 60)
    const total_hours = Math.floor(total_minutes / 60)

    const hours = total_hours.toString().padStart(2, '0')
    const minutes = (total_minutes % 60).toString().padStart(2, '0')
    const seconds = (total_seconds % 60).toString().padStart(2, '0')
    const milliseconds = (ms % 1000).toString().padStart(2, '0')

    return `${hours}:${minutes}:${seconds}:${milliseconds}`
  }

  // Remove:
  // - text between parentheses: ex: (CAR APPROACHING)
  // - text between brackets: ex: [CAR APPROACHING]
  cleanLines = () => {
    const lines: Array<Line> = []

    this.state.lines.map(line => {
      line.text = line.text.replace(/ *\([^)]*\) */g, '')
      line.text = line.text.replace(/ *\[[^\]]*\] */g, '')

      if (line.text.trim() !== '')
        lines.push(line)
    })

    this.setState({ lines: lines })
  }

  removeLine = (id: string) => {
    this.setState({ lines: this.state.lines.filter(line => line.id !== id) })
  }

  export = () => {
    alert('TODO')
  }


  render() {
    return (
      <div className="App">
        <input type="file" onChange={e => this.importSrt(e.target!.files![0])} /> &nbsp;
        <button onClick={this.cleanLines}>clean</button> &nbsp;
        <button onClick={this.export}>export</button>
        <br/><br/>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Start</th>
              <th>End</th>
              <th>Text</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.lines.map(line => {
              return (
                <tr>
                  <td>{line.id}</td>
                  <td style={styles.timestamp}>{this.displayTimestamp(line.startTime)}</td>
                  <td style={styles.timestamp}>{this.displayTimestamp(line.endTime)}</td>
                  <td>{line.text}</td>
                  <td>
                    <span onClick={() => this.removeLine(line.id)}>remove</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}


const styles: {[key: string]: React.CSSProperties} = {
  root: {

  },
  timestamp: {
    fontFamily: 'monospace',
  }
}


