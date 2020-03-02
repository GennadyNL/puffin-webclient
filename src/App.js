import React, { Component } from 'react';
import { Button } from 'reactstrap';
import './App.css';

let puffinURL = "http://webhook.site/82381020-8729-47f6-aca6-a0c4a09f8507"

let centralText = "Choose a file for validation and press Upload button"
let instanceId = ""
let uploadButtonDisabled = true
let requestUpdateButtonDisabled = true
let saveResponseButtonDisabled = true
let uploadButtonDisabledClass = "Button Button-Disabled"
let requestUpdateButtonDisabledClass = "Button Button-Left Button-Disabled"
let saveResponseButtonDisabledClass = "Button Button-Left Button-Disabled"
let sentFile

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: 0
    }
    this.handleSelectedFile = this.handleSelectedFile.bind(this)
    this.handleUpload = this.handleUpload.bind(this)
    this.requestUpdate = this.requestUpdate.bind(this)
    this.downloadResponse = this.downloadResponse.bind(this)
  }

  updateContent = fileContent => {
    this.setState({ message: fileContent })
  }

  updateFileDetails = fileDetails => {
    this.setState({ fileDetails: fileDetails })
  }

  updateCentralText = centralTextInput => {
    centralText = centralTextInput
  }

  updateInstanceId = () => {
    this.setState({ instanceId: "Instance Id: " + instanceId })
  }

  handleSelectedFile = e => {
    this.updateContent("Loading file content...")
    this.updateCentralText("File content:")

    this.setState({
      selectedFile: e.target.files[0],
      loaded: 0,
    })

    if (e.target.files[0].size >= 1024) {
      let formattedSize = this.returnFormattedFileSize(e.target.files[0].size)
      this.updateFileDetails("Filename: " + e.target.files[0].name + "\nFilesize : " + formattedSize + " (" + e.target.files[0].size + " bytes)")
    }
    else {
      this.updateFileDetails("Filename: " + e.target.files[0].name + "\nFilesize : " + e.target.files[0].size + " bytes")
    }
    sentFile = e.target.files[0].name

    // This code can read the selected file and show its content in browser; works slow with large (20+ Mb) files
    const readSelectedFile = e => {
      const reader = new FileReader()
      reader.onloadend = async (e) => {
        const text = e.target.result
        this.updateContent(text)
      };
      reader.readAsBinaryString(e.target.files[0])
    }
    readSelectedFile(e)

    // Enable and restyle Upload button
    uploadButtonDisabled = false
    uploadButtonDisabledClass = "Button"
  }

  handleUpload = () => {
    this.updateCentralText("Uploading file to Puffin...")
    this.updateContent("")

    let request = new XMLHttpRequest()
    request.open('POST', puffinURL)
    request.setRequestHeader('Content-Type', 'application/hal+json; charset=UTF-8')

    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        //console.log('Headers:', request.getAllResponseHeaders())
        this.updateCentralText("Response code: " + request.status + " | Response body:")
        this.updateContent(request.responseText)

        // Determine and set instance id for further usage
        let searchForInstanceId = this.state.message.match(new RegExp("/instance/(.*)/instance-"))
        if (searchForInstanceId != null) {
          instanceId = searchForInstanceId[1]
          this.updateInstanceId()
        }
      }
    }

    let content = btoa(this.state.message)
    let body = JSON.stringify(
      {
        "instance":
        {
          "name": "instance.xbrl",
          "content": content,
          "mediaType": "application/xml; charset=ISO-8859-1"
        }
      })
    request.send(body)

    // Enable Request Update and Save Response buttons
    requestUpdateButtonDisabled = false
    saveResponseButtonDisabled = false
    requestUpdateButtonDisabledClass = "Button Button-Left"
    saveResponseButtonDisabledClass = "Button Button-Left"
  }

  downloadResponse = () => {
    const responseText = this.state.message
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + responseText)

    const padNumber = number => number < 10 ? '0' + number : number
    const d = new Date()
    const responseDate = d.getFullYear() + '' + padNumber(d.getMonth() + 1) + padNumber(d.getDate()) + '-' + d.getHours() + padNumber(d.getMinutes()) + padNumber(d.getSeconds())
    const documentName = responseDate + '-' + sentFile + '.json'

    element.setAttribute('download', documentName)
    element.style.display = 'none'

    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  requestUpdate = () => {
    this.updateCentralText("Requesting update ...")
    this.updateContent("")

    let request = new XMLHttpRequest()
    request.open('GET', puffinURL + '/' + instanceId + '/instance-validation-report')
    // request.setRequestHeader('Authorization', 'Basic 878aeff6-6b5b-48ec-9c3b-9ca54a47b766')

    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        //console.log('Headers:', request.getAllResponseHeaders())
        this.updateCentralText("Response code: " + request.status + " | Response body:")
        this.updateContent(request.responseText)
      }
    }
    request.send()
  }

  returnFormattedFileSize = filesize => {
    var fileSizeExtension = ['Bytes', 'Kb', 'Mb', 'Gb']
    let i = 0
    while (filesize > 900) {
      filesize /= 1024
      i++
    }
    var exactSize = (Math.round(filesize * 100) / 100) + ' ' + fileSizeExtension[i];
    return exactSize;
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className="divTable">
            <div className="divTableRow">
              <div className="divTableCell">

                <div className="divTableRow">
                  <label for="selectUserFile">
                    <input className="SelectButtonHide" id="selectUserFile" type="file" onChange={e => this.handleSelectedFile(e)} />
                    <div className="Button">Choose File</div>
                  </label>
                </div>

                <div className="divTableRow">
                  <div className="divTableCell">
                    <div className="FileDetails">{this.state.fileDetails}</div>
                  </div>
                </div>

                <div className="divTableRow">
                  <div className="divTableCell">
                    <Button id="uploadButton" className={uploadButtonDisabledClass} onClick={this.handleUpload} disabled={uploadButtonDisabled}>Upload File</Button>
                  </div>
                </div>
              </div>

              <div className="divTableCell">
                <img src="puffin_image.jpg" width="600" height="147" alt="Here is one puffin" />
              </div>

              <div className="divTableCell">
                <div className="divTableRow">
                  <div className="divTableCell">
                    <Button id="saveResponseButton" className={saveResponseButtonDisabledClass} onClick={this.downloadResponse} disabled={saveResponseButtonDisabled}>Save Response</Button>
                  </div>
                </div>

                <div className="divTableRow">
                  <div className="divTableCell">
                    <div className="configuredURL">Puffin URL:<br />{puffinURL} <br /><br />{this.state.instanceId}</div>
                  </div>
                </div>

                <div className="divTableRow">
                  <div className="divTableCell">
                    <Button id="requestUpdateButton" className={requestUpdateButtonDisabledClass} onClick={this.requestUpdate} disabled={requestUpdateButtonDisabled}>Request Update</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="divTableRow">
              <div className="divTableCell" />
              <div className="divTableCell">{centralText}</div>
              <div className="divTableCell" />
            </div>
          </div>
          <div className="FileContent">{this.state.message}</div>
        </div>
      </div>
    )
  }
}
export default App;