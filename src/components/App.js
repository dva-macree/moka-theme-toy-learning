/**
 * Created by Moyu on 16/10/20.
 */
import React from 'react';
import { bindActionCreators } from 'redux'
import {Link} from 'react-router'
import { connect } from 'react-redux'
import {Map} from 'immutable'

import Posts from './Posts'
import Article from './Article'
import ItemsBox from './ItemsBox'
import Header from './Header'
import BigPic from './BigPic'
import Pagination from './Pagination'
import Footer from './Footer'
import ArtNext from './ArtNext'
import utils from '../common/utils'
/*============================================
    react 的组件生命周期
    实例化
        首次实例化
            getDefaultProps
            getInitialState
            componentWillMount  在完成首次渲染之前调用，此时仍可以修改组件的state。
            render
            componentDidMount   真实的DOM被渲染出来后调用，
        实例化完成后的更新
            getInitialState
            componentWillMount  componentWillMount里允许我们初始化前最后一次对state进行修改，而不会触发重新渲染。
            render
            componentDidMount
    存在期
        组件已存在时的状态改变
            componentWillReceiveProps   组件接收到新的props时调用，并将其作为参数nextProps使用，此时可以更改组件props及state。
            shouldComponentUpdate       组件是否应当渲染新的props或state，返回false表示跳过后续的生命周期方法
            componentWillUpdate         接收到新的props或者state后，进行渲染之前调用，此时不允许更新props或state。
            render
            componentDidUpdate          完成渲染新的props或者state后调用，此时可以访问到新的DOM元素。
        销毁&清理期
            componentWillUnmount        组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器。
 ============================================*/
class App extends React.Component {
    constructor(props) {
        super(props);
        // this.getBigPicText.bind(this)
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {

        return this.props.location.pathname != nextProps.location.pathname
            || !Map(this.props.state).equals(Map(nextProps.state));
    }
    componentWillUpdate(nextProps, nextState, nextContext) {
    }
    /*================================================
        react.context
        react context 的作用
        在react中，数据以流的形式自上而下的传递，
        但在一些情况下，我们希望在某一级的自组件中直接得到上N级父组件的props中的值
        即所谓的 【越级传递】

     =================================================*/
    componentWillReceiveProps(nextProps) {
        const {params, state, location} = nextProps;
        const {router} = this.context;
        const {remote} = state;
        const {db, theme, moka} = remote;

        this.setState({prevView: this.props.location.pathname})
        this.props.location.pathname != nextProps.location.pathname
        && !(utils.isTagsPagesPath(this.props.location.pathname) && utils.isTagsPagesPath(nextProps.location.pathname))
        && this.storeTagName();

        if(params.tagName && utils.isTagsPath(location.pathname) && !db.index.tagMap[params.tagName] ||
            params.hrefTitle && utils.isArticlePath(location.pathname) && !db.main[params.hrefTitle] ) {
            router.push('/posts');
        }
    }
    componentDidMount() {
        utils.loaded();
    }
    componentWillMount() {
        // this.storeTagName();
        const {actions, params} = this.props;
        const {pathname} = this.props.location;
        const {tagName} = this.props.params;
        const {remote} = this.props.state;
        const {router} = this.context;
        const {theme, db} = remote;
        const {leftPic, icons} = theme;
        let {bgColor, smText, lgText} = leftPic;

        if(params.tagName && utils.isTagsPath(pathname) && !db.index.tagMap[params.tagName] ||
            params.hrefTitle && utils.isArticlePath(pathname) && !db.main[params.hrefTitle] ) {
            router.push('/posts');
        }

        // !!icons && Array.isArray(icons) && actions.setIcons(icons)
    }
    componentDidUpdate(prevProps, prevState) {}
    componentWillUnmount() {}

    getBigPicText() {
        const {pathname} = this.props.location;
        const {tagName} = this.props.params;
        const {actions} = this.props;
        const {remote} = this.props.state;
        const {theme} = remote;
        const {leftPic, icons} = theme;
        let {bgColor, smText, lgText} = leftPic;

        
        if(utils.isTagsPath(pathname) && !utils.isTagsPagesPath(pathname)) {
            lgText = tagName;
            smText = 'TAG';
        }
        return {
            lgText,
            smText
        }
    }

    static defaultProps = {

    }
    static propTypes = {

    }
    state = {

    }

    /*================================================
        contextTypes是React中的一个类型验证机制，用于验证context属性的类型
     ================================================*/
    static contextTypes = {
        router: React.PropTypes.object.isRequired
    }

    render() {
        // console.log('App', this.props)
        return (
            <div>
                {this.renderChild()}
            </div>
        )
    }

    data = {

    }

    renderFrame(childs) {
        return (
            <main>
                <section className="previews">
                    {
                        React.Children.map(childs, function(child, i) {
                                return React.cloneElement(child, {
                                    key: i
                                })
                            }
                        )
                    }
                </section>
            </main>
        )
    }
    
    renderChild() {
        const {router} = this.context;
        const {prevView} = this.state;
        const {children, location, state, params, actions} = this.props;
        let {remote} = state;
        const {db, theme, moka} = remote;
        let { title, summaryNumber, leftPic, icons, pageSize, tagPageSize, profile, fillCovers, lazyLoadCover, iconTarget} = theme;
        const {main, index} = db;
        const {sorted, tagMap} = index;
        const {pathname} = location;
        let {hrefTitle, tagName, page, searchKey} = params;
        
        if(!state.bigPic.bgUrl) {
            delete state.bigPic.bgUrl;
        }
        const bigPic = Object.assign({}, leftPic, state.bigPic, this.getBigPicText())

        let links = ["/posts"+(pageSize!=null?'/1':''), "/tags"+(tagPageSize!=null?'/pages/1':'')]
        let start, end, prev, next;

        Array.isArray(fillCovers) && utils.fillCovers(sorted, main, fillCovers, lazyLoadCover)

        //根据路径判断不同的页面类型
        if(utils.isRootPath(pathname) || utils.isPostsPath(pathname)) {
            /**
                根路径 post路径下的页面
             */
            utils.setTitle('Posts - '+title);
            utils.setMainSummary(main, summaryNumber-0)
            if(utils.isRootPath(pathname)) {
                page = 1;
            }

            if((!!page && !isNaN(page) || page>0) && pageSize>0) {
                start = (page-1)*pageSize;
                end = page * pageSize
            } else {
                start = 0;
                end = Object.keys(main).length;
                page = 1;
            }
            if(start>0 && page>1) {
                prev = '/posts/'+(page-1)
            }
            if(end<sorted.length) {
                next = '/posts/'+(page-0+1)
            }
            const posts = sorted.slice(start, end)
                .map(k => {
                    return {
                        hrefTitle: k,
                        summary: main[k].summary,
                        date: main[k].head.date,
                        cover: main[k].head.cover,
                        title: main[k].head.title
                    }
                }
            );
            return (
                this.renderFrame([
                    <BigPic {...bigPic}/>,
                    <div>
                        <Header active="0" links={links}/>
                        <div className="tab active">
                            <Posts posts={posts} hoverHandler={a=>actions.setBigPicBg(a)}/>
                            <Pagination prev={prev} next={next}/>
                            <Footer icons={icons} method={iconTarget}/>
                        </div>
                    </div>
                ])
            )
        } else if(utils.isTagsRootPath(pathname) || utils.isTagsPagesPath(pathname)) {
            /**
                某个Tag下的articles 页面
             */
            utils.setTitle('Tags - '+title);
            let items;
            if(!index.tagItems) {
                items = Object.keys(tagMap).map(tagName => {
                    const hrefTitles = tagMap[tagName];
                    const x = hrefTitles.map(t=>main[t]).find(x=>{
                        return !!x.head.cover && !x.head.fakeCover
                    }) || main[hrefTitles[0]]
                    return {
                        title: tagName,
                        text: hrefTitles.length+' Posts',
                        picUrl: !!x&&x.head.cover || '',
                        href: '/tags/'+tagName
                    }
                });
                index.tagItems = items;
            } else {
                items = index.tagItems;
            }
            if((!!page && !isNaN(page) || page>0 )&& tagPageSize>0) {
                start = (page-1)*tagPageSize;
                end = page * tagPageSize
            } else {
                start = 0;
                end = items.length;
                page = 1;
            }
            if(start>0 && page>1) {
                prev = '/tags/pages/'+(page-1)
            }
            if(end<items.length) {
                next = '/tags/pages/'+(page-0+1)
            }

            let texts;
            let showBack = false;
            if(!!this.state && utils.isTagsPath(this.state.pathname) && !utils.isTagsPagesPath(this.state.pathname)) {
                texts = [this.state.tagName, 'Tags']
                links[0] = '/tags/'+this.state.tagName
                showBack = true;
            }

            return (
                this.renderFrame([
                    <BigPic {...bigPic} showBack={showBack}/>,
                    <div>
                        <Header active="1" links={links} texts={texts}/>
                        <div className="tab active">
                            <ItemsBox items={items.slice(start, end)} btnText="View All" hoverHandler={a=>actions.setBigPicBg(a)}/>
                            <Pagination next={next} prev={prev} />
                            <Footer icons={icons} method={iconTarget}/>
                        </div>
                    </div>
                ])
            )
        } else if(utils.isTagsPath(pathname)) {
            utils.setTitle(tagName +' - '+title);
            if(!tagMap[tagName]) {
                return;
            }
            const map = tagMap[tagName].reduce((p, n) => {
                p[n] = main[n];
                return p;
            }, {})
            utils.setMainSummary(map);
            const posts = tagMap[tagName].map(t=>{
                return {
                    title: map[t].head.title,
                    date: map[t].head.date,
                    cover: map[t].head.cover,
                    summary: map[t].summary,
                    hrefTitle: t
                }
            })
            links[0] = '/tags/'+tagName

            return (
                this.renderFrame([
                    <BigPic {...bigPic} showBack={true}/>,
                    <div>
                        <Header active="0" links={links} texts={[tagName, 'Tags']} />
                        <div className="tab active">
                            <Posts scroll={!!prevView&&(utils.isTagsRootPath(prevView)||utils.isTagsPagesPath(prevView))} posts={posts} hoverHandler={a=>actions.setBigPicBg(a)}/>
                            <Pagination prev={prev} next={next}/>
                            <Footer icons={icons} method={iconTarget}/>
                        </div>
                    </div>
                ])
            )
        } else if(utils.isArticlePath(pathname)) {
            let article = main[hrefTitle];
            if(!article) {
                return;
            }
            if(profile) {
                profile.icons = icons;
            }

            let nextdata;
            const i = sorted.indexOf(hrefTitle)
            if(i>=0) {
                utils.setTitle(main[sorted[i]].head.title +' - '+title);
                nextdata = i!=sorted.length-1 ? {
                    title: main[sorted[i+1]].head.title,
                    cover: main[sorted[i+1]].head.cover,
                    href: '/article/'+sorted[i+1]
                }: null
            }

            let tags = article.head.tags;
            if(!Array.isArray(tags)) {
                tags = [tags]
            }

            return (
                <main>
                    <Article 
                        title={article.head.title} date={article.head.date} showBack={true}
                        tags={tags} cover={article.head.cover} content={article.content}
                        profile={profile} method={iconTarget}
                    />
                    {nextdata && <ArtNext {...nextdata}/>}
                </main>
            )
        } else {
            utils.setTitle('Archive - '+title);
            const words = searchKey && searchKey.split(/[ +]/);
            let items = sorted;
            if(Array.isArray(words)) {
                utils.setMainSummary(main, summaryNumber-0);
                const priority = {}
                items = items.filter(href => {
                    const item = main[href];
                    return words.every(w => {
                        if(utils.testWord(w, item.head.title)) {
                            priority[href] = 1;
                            return true;
                        } 
                        if(utils.testWord(w, item.pureText)) {
                            priority[href] = 2;
                            return true;
                        }
                    })
                })
                .sort((a, b) => priority[a] === priority[b] ? (sorted.indexOf(a) - sorted.indexOf(b)) : (priority[a] - priority[b]))
            }
            items = items.map(href=>{
                const item = main[href];
                return {
                    picUrl: item.head.cover,
                    title: item.head.title,
                    text: item.head.date,
                    href: '/article/'+href
                }
            })
            return (
            <main>
            <section className="archives animated fadeIn">
                <Link className="nav nav--black" to="/">
                  <i className="fa fa-lg fa-arrow-left"></i>
                  <span>Back to Posts</span>
                </Link>
                <span className="archives_right">
                    <span>{ items.length }</span>
                    <i className="fa fa-lg fa-file-text"></i>
                </span>
                <header className="archives__header">
                    <span>{'Archive'}</span>
                </header>
                <div className="serach-div">
                    <input placeholder="Serach..." defaultValue={searchKey} spellCheck={false} autoCorrect='off'
                        onFocus={() => utils.setMainSummary(main, summaryNumber-0)}
                        onChange={e=>{
                            utils.setMainSummary(main, summaryNumber-0);
                            router.push('/archive/'+encodeURIComponent(e.target.value.trim()));
                        }}
                    />
                </div>
                <ItemsBox big={true} scroll={!(!!prevView&&utils.isArticlePath(prevView))} btnText="Read Post" items={items} />
            </section>
            </main>
            )
        }

    }

    storeTagName(props=this.props) {
        const {location, params, actions} = props;
        const {pathname} = location;
        const {tagName} = params;
        if(utils.isTagsPath(pathname)) {
            this.setState({
                pathname,
                tagName
            })
        } else if(!utils.isTagsRootPath(pathname) && !utils.isTagsPagesPath(pathname)) {
            this.setState({
                pathname: null,
                tagName: null
            })
        }
    }
}

function MapStateToProps(state) {
    return {
        state
    }
}

function MapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(require('../reducers/actions'), dispatch)
    }
}

module.exports = connect(
    MapStateToProps,
    MapDispatchToProps
)(App)

