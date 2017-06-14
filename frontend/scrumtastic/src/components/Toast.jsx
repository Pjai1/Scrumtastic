function Toast(message, removeAfter) {

    this.message = message || ""
    this.intervalInstance = null 
    this.domNode = null
    this.removeAfter = removeAfter || 2500
    this.parent = null
}

Toast.prototype.Render = function() {

    var node = document.createElement('div')
    node.className = 'toast-body'
    node.innerHTML = '<span class="toast-message">' + this.message + '</span>'

    var body = document.querySelector('body')
    if(body && !this.domNode && !this.parent) {
        body.appendChild(node)

        this.domNode = node
        this.parent = body

        this.intervalInstance = setTimeout(function() {
            this.Dismiss()
        }.bind(this), this.removeAfter)
    }
}

Toast.prototype.Dismiss = function() {

    if(this.parent && this.domNode) {

        if(this.intervalInstance) {
            clearTimeout(this.intervalInstance)
        }

        this.parent.removeChild(this.domNode)
    }
}

module.exports = Toast