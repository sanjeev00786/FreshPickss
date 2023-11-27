export class DragAndDropHandler {
  constructor(elementId, previewElementId, fileInputId, previewFunction) {
    this.dropZone = document.getElementById(elementId)
    this.previewElement = document.getElementById(previewElementId)
    this.fileInput = document.getElementById(fileInputId)
    this.previewFunction = previewFunction
    this.uploadedFiles = [];

    this.initialize()
  }

  initialize() {
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault()
      this.dropZone.classList.add('drag-over')
    })

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drag-over')
    })

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault()
      // Check if the number of selected files exceeds 5
      if (e.dataTransfer.files.length > 5) {
      // Handle the case where more than 5 files are selected (e.g., show an error message)
        alert('You can select a maximum of 5 images.')
      } else {
        Array.from(e.dataTransfer.files).forEach((file) => {
          this.createPreview(file)
        })
      }
    })

    this.fileInput.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach((file) => {
        this.createPreview(file)
      })
    })
  }

  createPreview(file) {
    this.uploadedFiles.push(file)
    if (file.type.startsWith('image/')) {
      this.createImagePreview(file, imagePreviewContainer)
    } else if (file.type.startsWith('video/')) {
      this.createVideoPreview(file, videoPreviewContainer)
    }
  }

  createImagePreview(file, container) {
    if (file.type.startsWith('image/')) {
      const imageContainer = document.createElement('div')
      imageContainer.classList.add('image-container')

      const imageElement = new Image()
      imageElement.classList.add('image-preview')
      imageElement.style.maxWidth = '100px'
      imageElement.style.maxHeight = '100px'
      imageElement.style.objectFit = 'cover'

      const closeButton = document.createElement('div')
      closeButton.innerHTML = '<img src="../../assets/cancel.svg" alt="">'
      closeButton.classList.add('close-button')
      closeButton.addEventListener('click', () => {
        imageContainer.remove()
        if (this.imagePreviewContainer.children.length === 0) {
          this.dropZoneText = document.querySelector('#imageDropZone p')
          this.imagePreview = document.getElementById('imagePreview')
          this.dropZoneText.style.display = 'contents'
          this.imagePreview.style.display = 'block'
          this.fileInput.value = ''
        }
      })

      const reader = new FileReader()
      reader.onload = (e) => {
        imageElement.src = e.target.result
      }

      reader.readAsDataURL(file)

      const fileNameContainer = document.createElement('div')
      fileNameContainer.classList.add('file-name')

      imageContainer.appendChild(imageElement)
      imageContainer.appendChild(closeButton)
      imageContainer.appendChild(fileNameContainer)
      container.appendChild(imageContainer)

      this.dropZoneText = document.querySelector('#imageDropZone p')
      this.imagePreview = document.getElementById('imagePreview')
      this.dropZoneText.style.display = 'none'
      this.imagePreview.style.display = 'none'

    }
  }

  createVideoPreview(file, container) {
    if (file.type.startsWith('video/')) {
      const videoContainer = document.createElement('div')
      videoContainer.classList.add('video-container')

      const videoElement = document.createElement('video')
      videoElement.classList.add('video-preview')
      videoElement.style.maxWidth = '400px'

      const closeButton = document.createElement('button')
      closeButton.innerHTML = 'X'
      closeButton.classList.add('close-button')
      closeButton.addEventListener('click', () => {
        videoContainer.remove()
        if (container.children.length === 0) {
          // Show/hide elements as needed
        }
      })

      const reader = new FileReader()
      reader.onload = (e) => {
        videoElement.src = e.target.result
        videoElement.controls = true

        videoElement.onloadedmetadata = function() {
          if (videoElement.duration <= 60) {
            // Video duration is 1 minute or less, proceed
            const fileNameContainer = document.createElement('div')
            fileNameContainer.classList.add('file-name')
            fileNameContainer.innerText = `File Name: ${file.name}`

            videoContainer.appendChild(videoElement)
            videoContainer.appendChild(closeButton)
            videoContainer.append(fileNameContainer)

            container.appendChild(videoContainer)
          } else {
            alert('Video duration must be 1 minute or less.')
          }
        }

      }

      reader.readAsDataURL(file)
      
    }
  }

  getUploadedFiles() {
    return this.uploadedFiles
  }
  
}

// Function to preview an image
export function previewImage(file, imagePreviewElement) {
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviewElement.src = e.target.result
  }
  reader.readAsDataURL(file)
}

// Function to preview a video
export function previewVideo(file, videoPreviewElement) {
  const reader = new FileReader()
  reader.onload = (e) => {
    videoPreviewElement.src = e.target.result
  }
  reader.readAsDataURL(file)
}


