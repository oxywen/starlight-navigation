const WALLPAPER_SERVER_URL = 'http://localhost:8806'
const OTHER_RANDOM_WALLPAPER_SERVER_URL = 'https://api.yimian.xyz/img?type=wallpaper&t='

//配置信息
let options = loadConfig();
if (!options.bgImageURL) {
    getStarlightWallpaper()
}
const formWrapper = $('#form-warpper')
const candidateContainer = $('#candidate-list-container')
const mainInput = $('#main-input')
let activeItemIndex = -1
let inputWord = ''

$(() => {
    updateBgImage()
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
    /**
     * 搜索框的隐藏和显示
     */
    $('.hidden-search-btn').on('click', (e) => {
        if (formWrapper.hasClass('s-hidden')) {
            formWrapper.removeClass('s-hidden')
        } else {
            formWrapper.addClass('s-hidden')
        }
    })
    $('.bg-switcher-btn').on('click', (e) => {
        $('.bg-switcher .vertical-line').css('height', '128px')
        setTimeout(() => {
            $('.bg-switcher .vertical-line').css('height', '100px')
        }, 300)
        switchBgImage()
    })
    $('.menu-icon').on('click', (e) => {
        $('#menu-drawer').removeClass('hidden-drawer')
    })
    $('.drawer-mask').on('click', (e) => {
        $(e.currentTarget.parentNode).addClass('hidden-drawer')
    })
    $('.switch-engine-btn').on('click', (e) => {
        let imgUrl = ''
        let nextEngine = ''
        switch (options.engine) {
            case 'Baidu':
                nextEngine = 'Google'
                imgUrl = 'url("/assets/images/google.ico")'
                break
            case 'Google':
                nextEngine = 'Bing'
                imgUrl = 'url("/assets/images/bing.ico")'
                break
            case 'Bing':
                nextEngine = 'Baidu'
                imgUrl = 'url("/assets/images/baidu.ico")'
                break
        }
        setStorageItem('engine', nextEngine)
        $(e.currentTarget).find('.engine-icon').css('background-image', imgUrl)
        $(e.currentTarget).find('.engine-name').text(nextEngine)
    })
    $('.show-more-op').on('click', (e) => {
        if ($(e.currentTarget.firstElementChild).hasClass('direction-down')) {
            e.currentTarget.firstElementChild.classList.remove('direction-down')
            e.currentTarget.firstElementChild.classList.add('direction-up')
            $('.op-more').removeClass('h-hidden')
        } else {
            e.currentTarget.firstElementChild.classList.remove('direction-up')
            e.currentTarget.firstElementChild.classList.add('direction-down')
            $('.op-more').addClass('h-hidden')
        }
    })
    $('.type-select-btn').on('click', (e) => {
        $('.type-select-wrapper').removeClass('h-hidden')
    })
    $('.type-select-wrapper').on('click', (e) => {
        e.currentTarget.classList.add('h-hidden')
        const typ = e.target.getAttribute("value")
        const text = e.target.innerText
        options.randomType = typ
        $('.type-select-btn').text(text)
    })

    $('#lock-bg-switcher').on('change', (e) => {
        let checked = e.target.checked
        if (checked) {
            $('.bg-switcher').addClass('bg-switcher-hidden')
        } else {
            $('.bg-switcher').removeClass('bg-switcher-hidden')
        }
    })
})

/**
 * 从本地存储中加载配置
 */
function loadConfig() {
    return {
        engine: loadStorageItem('engine', 'Baidu'),
        isLock: loadStorageItem('isLock', false),
        isRandom: loadStorageItem('isRandom', false),
        randomType: loadStorageItem('randomType', 'scenery'),
        bgImageURL: loadStorageItem('bgImageURL', ''),
        bgImageLocation: loadStorageItem('bgImageLocation', ''),
        bgImageCopyright: loadStorageItem('bgImageCopyright', '©2021 NAV.OXYWEN.CN')
    }
}

function setStorageItem(key, value, isSessionStorage) {
    if (value == null || value == undefined) {
        return
    }
    let storage = isSessionStorage ? this.sessionStorage : localStorage
    storage.setItem(key, value)
    //更新本地的
    options[key] = value
}

/**
 * 
 * @param {key} key 
 * @param {当值不存在的时候返回的默认值} defaultValue 
 * @param {是否是sessionStorage，默认不是} isSessionStorage 
 * @returns 
 */
function loadStorageItem(key, defaultValue, isSessionStorage) {
    let storage = isSessionStorage ? this.sessionStorage : localStorage
    let value = storage.getItem(key)
    if (value == null || value == undefined) {
        return defaultValue
    }
    return value
}

function loadTodayBingBg() {
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
    switch (options.engine) {
        case 'Baidu':
            getBaiduCandidate(key, renderCandidateItems)
            break
        case 'Google':
            getGoogleCandidate(key, renderCandidateItems)
            break
        case 'Bing':
            getBingCandidate(key, renderCandidateItems)
            break
    }
}

function getBaiduCandidate(key, render) {
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

function getGoogleCandidate(key, render) {
    $.ajax({
        url: "https://suggestqueries.google.com/complete/search",
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
        for (let i = 0, len = array.length; i < len; i++) {
            datas.push(array[i][0])
        }
        render(datas)
    })
}

function getBingCandidate(key, render) {

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
    switch (options.engine) {
        case 'Baidu':
            url = 'https://www.baidu.com/s?ie=utf-8&tn=baidu&wd=' + wd
            break
        case 'Google':
            url = 'https://www.google.com/search?q=' + wd + '&source=hp&sclient=gws-wiz'
            break
        case 'Bing':
            // todo
            url = 'https://www.baidu.com/s?ie=utf-8&tn=baidu&wd=' + wd
            break
    }
    window.location.href = url
}

function switchBgImage() {
    // let url = 'https://api.yimian.xyz/img?type=wallpaper&t=' + new Date().getTime()
    //let url= 'https://api.yimian.xyz/img?type=wallpaper'
    getStarlightWallpaper()
    updateBgImage()
    // $('body').css('background-image', 'url(' + url + ')')
}

function getStarlightWallpaper(t) {
    let uri = '/api/v1/rand'
    if (t != null && t != undefined) {
        uri = uri + '/' + t
    }
    uri += '?t=' + new Date().getTime()
    let url = WALLPAPER_SERVER_URL + uri
    $.ajax({
        url: url,
        type: "GET",
        crossDomain: true,
        dataType: "json",
        success: (res) => {
            if (res.code == 200) {
                setStorageItem('bgImageURL', WALLPAPER_SERVER_URL + res.data)
            } else {
                console.log(res)
            }
        },
        error: (e) => {
            console.log(res)
        }
    })
}


function updateBgImage() {
    $('body').css('background-image', 'url("' + options.bgImageURL + '")')
}