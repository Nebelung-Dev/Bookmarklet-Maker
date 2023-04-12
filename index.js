var javascript = document.getElementById("javascript")
var css = document.getElementById("css")

M.Chips.init(javascript, {placeholder: "Javascript URLs", secondaryPlaceholder: "Add URL", onChipAdd: update, onChipDelete: update})
M.Chips.init(css, {placeholder: "CSS URLs", secondaryPlaceholder: "Add URL", onChipAdd: update, onChipDelete: update})

document.querySelectorAll(".input").forEach(item => {
    item.setAttribute("spellcheck", "false")
})

function getChips(elem) {
    var allChips = []

    var instance = M.Chips.getInstance(elem)

    var chips = instance.$chips

    for (let chip in chips) {
        if (chips[chip] instanceof Element) {
            allChips.push(chips[chip].innerHTML.replace(`<i class=\"material-icons close\">close</i>`, ``))
        }
    }

    return allChips;
}

var textareas = document.querySelectorAll("textarea")
var maxHeight = 384

for (let textarea in textareas) {
    if (textareas[textarea] instanceof Element) {
    textareas[textarea].addEventListener("input", function() {
        textareas[textarea].style.height = ""
        textareas[textarea].style.height = Math.min(textareas[textarea].scrollHeight, maxHeight) - 32 + "px"
    })
    }
}

function generate() {
    var bookmarklet = `javascript:(function(){`

    var javascriptURLS = getChips(javascript)
    if (javascriptURLS.length) {
        bookmarklet += `(function(){`

        for (let url in javascriptURLS) {
            bookmarklet += `document.head.appendChild(document.createElement('script')).src='${javascriptURLS[url]}';`
        }

        bookmarklet += `})();`
    }

    var cssURLS = getChips(css)
    if (cssURLS.length) {
        bookmarklet += `(function(){`

        for (let url in cssURLS) {
            bookmarklet += `var s=document.createElement('link');s.rel='stylesheet';s.href='${cssURLS[url]}';document.head.appendChild(s);`
        }

        bookmarklet += `})();`
    }

    var code = document.getElementById("code").value
    if (code) {
        try {
        var minifyJS = uglify(code.replaceAll("\n", ";"))
        if (minifyJS) {
            bookmarklet += `(function(){`
            bookmarklet += minifyJS
            bookmarklet += `})();`
        }
        } catch {
        }
    }

    var style = document.getElementById("style").value
    if (style) {
        var minifyCSS = csso.minify(style.replace(/\\n/g)).css
        if (minifyCSS) {
            bookmarklet += `(function(){`
            bookmarklet += `document.head.appendChild(document.createElement('style')).innerHTML='`
            bookmarklet += minifyCSS
            bookmarklet += `'`
            bookmarklet += `})();`
        }
    }

    bookmarklet += `})();`

    return bookmarklet;
}

var updateElements = ["buttonTitle", "bookmarkletTitle", "javascript", "css", "code", "style"]
for (let e in updateElements) {
var element = document.getElementById(updateElements[e])
if (element instanceof Element) {
element.addEventListener("input", update)
}
}

function generateButtonCode(code) {
var parser = new DOMParser();

var doc = parser.parseFromString(code, "text/html");

doc.body.querySelector(".resultButtonText").removeAttribute("id")
doc.body.querySelector(".resultLink").removeAttribute("id")

var buttonCSS = `<style>
    body {
        --theme: #f2d078;
        --text: white;
        --text-inverse: black;
    }

    .resultButton {
        background: var(--theme);
        height: 3rem;
        font-size: 16px;
        border: none;
        border-radius: 6px;
        outline: none;
        cursor: pointer;
        user-select: none;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        padding: 0 1rem;
        position: relative;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
        max-width: -webkit-fill-available;
        overflow: hidden;
    }

    .resultButton .resultButtonText {
        color: var(--text-inverse);
    }

    .resultLink {
        opacity: 0;
        user-select: none;
        height: 100%;
        width: 100%;
        padding: 0 1rem;
        border-radius: 6px;
        position: absolute;
        right: 0;
        left: 0;
        top: 0;
        bottom: 0;
    }
</style>`

var result = doc.body.innerHTML + "\n\n" + buttonCSS

return result;
}

function update() {
    var resultButtonText = document.getElementById("resultButtonText")
    var resultLink = document.getElementById("resultLink")
    var buttonTitle = document.getElementById("buttonTitle").value.trim()
    var bookmarkletTitle = document.getElementById("bookmarkletTitle").value.trim()
    var resultCode = document.getElementById("resultCode")
    var copy = resultCode.parentElement.querySelector(".copy")

    var buttonCode = document.getElementById("buttonCode")
    var copy2 = buttonCode.parentElement.querySelector(".copy")

    var bookmarklet = generate()

    resultButtonText.innerText = buttonTitle ? buttonTitle : "Bookmarklet"
    resultLink.innerText = bookmarkletTitle ? bookmarkletTitle : "Bookmarklet"

    if (bookmarklet !== "javascript:(function(){})();") {
        resultLink.setAttribute("href", bookmarklet)
        resultCode.value = bookmarklet
        buttonCode.value = generateButtonCode(resultButtonText.parentElement.outerHTML.replace(/\\n/g, 'newline').trim())
        copy.removeAttribute("hidden")
        copy2.removeAttribute("hidden")
    } else {
        resultLink.removeAttribute("href")
        resultCode.value = ""
        buttonCode.value = ""
        copy.setAttribute("hidden", "")
        copy2.setAttribute("hidden", "")
    }
}

function copy(elem) {
    var copyText = elem.parentElement.querySelector(".copyText")
    var code = elem.parentElement.children[0]

    code.select()
    code.setSelectionRange(0, 99999)
    navigator.clipboard.writeText(code.value)
    
    copyText.classList.add("opencopytext")
    setTimeout(function() {
        copyText.classList.remove("opencopytext")
    }, 1000)
}
