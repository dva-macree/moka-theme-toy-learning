/**
 * Created by Moyu on 16/10/20.
 */
import React from 'react'
import {render} from 'react-dom'
import { combineReducers, createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import {routerReducer, syncHistoryWithStore} from 'react-router-redux'
import { Router, Route, IndexRoute, Redirect,IndexRedirect, browserHistory, hashHistory, useRouterHistory } from 'react-router'
import thunkMiddleware from 'redux-thunk'
import {createHashHistory} from 'history'

import configureStore from './reducers/configureStore'
import * as reducers from './reducers/appReducers'
import App from './components/App'
import Posts from './components/Posts'
import Article from './components/Article'
import ItemsBox from './components/ItemsBox'
import './common/css/main.text.less'
import './common/css/loading.text.less'
import './common/css/pace.text.less'
import utils from './common/utils'

/**
    reactRouter 
    Router  a common low-level interface for all router components    
    Route   renders some UI when a URL matches a location
 */
utils.remotePromise()
.then(remote => {
    const appReducers = combineReducers(Object.assign({}, reducers, {
        routing: routerReducer,
        remote: (s=remote) => s
        // routing: remote
    }));
    const store = createStore(
        appReducers,
        applyMiddleware(
            thunkMiddleware, // 允许我们 dispatch() 函数
            // loggerMiddleware // 一个很便捷的 middleware，用来打印 action 日志
        )
    )
    utils.sleep(200)
    .then(() => {
        console.log('remote', remote);
        render((
            <Provider store={store}>
                <Router history={ useRouterHistory(createHashHistory)({ queryKey: false }) }>
                    <Route path="/" component={App}>
                        <IndexRoute component={Posts}/>
                        <Route path="posts(/:page)" component={Posts}></Route>
                        <Route path="article(/:hrefTitle)" component={Article}></Route>
                        <Route path="tags(/:tagName)" component={ItemsBox}></Route>
                        <Route path="tags/pages/:page" component={ItemsBox}></Route>
                        <Route path="archive(/:searchKey)" component={ItemsBox}></Route>
                        <Route path="*" onEnter={(loc, replace)=>{replace('/')}} />
                    </Route>

                </Router>

            </Provider>
        ), document.getElementById('app'))
    });
})
