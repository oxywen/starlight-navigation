const options=loadConfig()
const formWrapper = $('#form-warpper')
const candidateContainer = $('#candidate-list-container')
const mainInput = $('#main-input')
let searchEngine = 'Baidu'
let activeItemIndex = -1
let inputWord = ''

$(() => {
    
    mainInput.focus()
    mainInput.on('mouseover', (e) => {
        formWrapper.addClass('input-hover')
    })
    mainInput.on('mouseout', (e) => {
        if (!formWrapper.hasClass('active-input')) {
            formWrapper.removeClass('input-hover')
        }
    })
    mainInput.on('input', (e) => {
        const key = e.target.value;
        if (key == '') {
            candidateContainer.empty();
            formWrapper.removeClass('active-input')
            return;
        }
        inputWord = key
        activeItemIndex = -1
        getCandidateWords(key)
    })
    mainInput.on('focus', (e) => {
        const wd = mainInput.val()
        formWrapper.addClass('input-focus')
        if (wd == '') {
            candidateContainer.empty();
            return;
        }
        if (candidateContainer.children().length == 0) {
            getCandidateWords(wd)
        } else {
            formWrapper.addClass('active-input')
        }
    })
    mainInput.on('blur', (e) => {
        formWrapper.removeClass('input-focus')
        formWrapper.removeClass('input-hover')
        if (!formWrapper.hasClass('candidate-container-hover')) {
            formWrapper.removeClass('active-input')
        }
    })
    mainInput.on('keydown', (e) => {
        const keyCode = e.keyCode
        switch (keyCode) {
            case 13:
                //Enter
                searchByInput()
                break
            case 38:
                //上
                switchCandidateActiveItem(-1)
                break
            case 40:
                //下
                switchCandidateActiveItem(1)
                break
            default:
                return
        }
        e.stopPropagation()
    })
    $('#search-btn').on('click', () => {
        searchByInput()
    })
    candidateContainer.on('mouseenter', (e) => {
        formWrapper.addClass('candidate-container-hover')
    })
    candidateContainer.on('mouseleave', (e) => {
        formWrapper.removeClass('candidate-container-hover')
    })
    candidateContainer.on('click', (e) => {
        debugger
        const wd = e.target.innerText
        if (wd == '' || wd.length == 0) {
            return
        }
        formWrapper.removeClass('candidate-container-hover')
        formWrapper.removeClass('active-input')
        goSearch(wd)
    })
    $('.bg-switcher-btn').on('click', (e) => {
        $('.bg-switcher .vertical-line').css('height', '128px')
        setTimeout(() => {
            $('.bg-switcher .vertical-line').css('height', '100px')
        }, 300)
        randomBg()
    })
    $('.menu-icon').on('click', (e) => {
        $('#menu-drawer').removeClass('hidden-drawer')
    })
    $('.drawer-mask').on('click', (e) => {
        $(e.currentTarget.parentNode).addClass('hidden-drawer')
    })
    $('.switch-engine-btn').on('click', (e) => {
        let imgUrl = ''
        switch (searchEngine) {
            case 'Baidu':
                searchEngine = 'Google'
                imgUrl = 'url("/assets/images/google.ico")'
                break
            case 'Google':
                searchEngine = 'Bing'
                imgUrl = 'url("/assets/images/bing.ico")'
                break
            case 'Bing':
                searchEngine = 'Baidu'
                imgUrl = 'url("/assets/images/baidu.ico")'
                break
        }
        $(e.currentTarget).find('.engine-icon').css('background-image', imgUrl)
        $(e.currentTarget).find('.engine-name').text(searchEngine)
    })
})

/**
 * 从本地存储中加载配置
 */
function loadConfig(){
    const options = {}
    options.engine = this.sessionStorage.getItem('engine')===null? 'baidu': this.sessionStorage.getItem('engine')
    options.randomBg=this.localStorage.getItem('randomBg')==null?'':this.localStorage.getItem('randomBg')
    options.bingImages = loadTodayBingBg()
    return options
}

function loadTodayBingBg(){
    const URL = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN'

}


function switchCandidateActiveItem(step) {
    const container = candidateContainer[0];
    const itemCount = container.childElementCount
    const nodes = container.childNodes
    const before = activeItemIndex
    activeItemIndex += step
    if (activeItemIndex < -1) {
        activeItemIndex = itemCount - 1
    } else if (activeItemIndex >= itemCount) {
        activeItemIndex = -1
    }
    if (before > -1) {
        nodes[before].classList.remove('active-candidate-item')
    }
    if (activeItemIndex == -1) {
        mainInput.val(inputWord)
    } else {
        const activeNode = nodes[activeItemIndex];
        activeNode.classList.add('active-candidate-item')
        mainInput.val(activeNode.innerText)
    }
}
/**
 * 获取候选词
 */
function getCandidateWords(key) {
    switch (searchEngine) {
        case 'Baidu':
            getBaiduCandidate(key,renderCandidateItems)
            break
        case 'Google':
            getGoogleCandidate(key,renderCandidateItems)
            break
        case 'Bing':
            getBingCandidate(key,renderCandidateItems)
            break
    }
}

function getBaiduCandidate(key,render) {
    $.ajax({
        url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
        type: 'GET',
        data: {
            wd: key,
            json: 1
        },
        dataType: "jsonp",
        jsonp: "cb"
    }).done((response) => {
        render(response.s)
    })
}

function getGoogleCandidate(key,render) {
    $.ajax({
        url: "http://suggestqueries.google.com/complete/search",
        type: "GET",
        data: {
            client: "youtube",
            q: key
        },
        dataType: "jsonp",
        jsonp: "jsonp"
    }).done((response) => {
        const array = response[1];
        const datas = []
        for(let i=0,len=array.length;i<len;i++){
            datas.push(array[i][0])
        }
        render(datas)
    })
}

function getBingCandidate(key,render) {

}

function renderCandidateItems(datas) {
    const len = datas.length;
    if (len == 0) {
        formWrapper.removeClass('active-input')
    } else if (!formWrapper.hasClass('active-input')) {
        formWrapper.addClass('active-input')
    }
    let array = []
    for (let i = 0; i < len; i++) {
        array.push('<div class="candidate-list-item">' + datas[i] + '</div>')
    }
    candidateContainer.html(array.join(''))
}


function searchByInput() {
    const wd = mainInput.val()
    if (wd == '' || wd.length == 0) {
        return
    }
    goSearch(wd)
}

function goSearch(wd) {
    if (wd == undefined || wd == '' || wd.length == 0) {
        return
    }
    let url = ""
    switch (searchEngine) {
        case 'Baidu':
            url='https://www.baidu.com/s?ie=utf-8&tn=baidu&wd=' + wd
            break
        case 'Google':
            url='https://www.google.com/search?q='+wd+'&source=hp&sclient=gws-wiz'
            break
        case 'Bing':
            url='https://www.baidu.com/s?ie=utf-8&tn=baidu&wd=' + wd
            break
    }
    window.location.href = url
}

function randomBg() {
    let url = 'https://api.yimian.xyz/img?type=wallpaper&t=' + new Date().getTime()
    //let url= 'https://api.yimian.xyz/img?type=wallpaper'
    $('body').css('background-image', 'url(' + url + ')')
}
