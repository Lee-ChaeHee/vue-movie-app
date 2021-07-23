import axios from "axios"
import _uniqBy from 'lodash/uniqBy'

const _defaultMessage = 'Search for the movie title!'

export default {
  // module! (모듈로서 사용할 수 있음을 명시하는 속성)
  namespaced: true,
  // data! (실제로 취급해야할 데이터)
  state: () => ({
    movies: [],
    message: _defaultMessage,
    loading: false,
    theMovie: {}
  }),
  // computed! (계산된 상태를 만들어냄)
  getters: {
    movieIds(state) {
      return state.movies.map(m => m.imdbID)
    }
  },
  // methods! (메소드와 유사한 개념)
  // 변이 (mutations 에서만 데이터 변경이 가능함)
  mutations: {
    resetMovies(state) {
      state.movies = [],
      state.message = _defaultMessage,
      state.loading = false
    },
    updateState(state, payload) {
      // ['movies', 'massage', 'loading']
      Object.keys(payload).forEach(key => {
        state[key] = payload[key]
      })
    },
  },
  // 비동기
  actions: {
    async searchMovies({ state, commit }, payload) {
      if (state.loading) return

      commit('updateState', {
        message: '',
        loading: true
      })

      try {
        const res = await _fetchMovie({
          ...payload,
          page: 1
        })

        const { Search, totalResults } = res.data
        commit('updateState', {
          movies: _uniqBy(Search, 'imdbID')
        })
        const total = parseInt(totalResults, 10)
        const pageLength = Math.ceil(total / 10)

        if (pageLength > 1) {
          for (let page = 2; page <= pageLength; page++) {
            if (page > (payload.number / 10)) break
            const res = await _fetchMovie({
              ...payload,
              page
            })
            const { Search } = res.data
            commit('updateState', {
              movies: [
                ...state.movies,
                ..._uniqBy(Search, 'imdbID')
              ]
            })
          }
        }
      } catch ({ message }) {
        commit('updateState', {
          movies: [],
          message
        })
      } finally {
        commit('updateState', {
          loading: false
        })
      }
    },
    async searchMovieWithId({ state, commit }, payload) {
      if (state.loading) return

      commit('updateState', {
        theMovie: {},
        loading: true
      })

      try {
        const res = await _fetchMovie(payload)
        console.log(res)
        commit('updateState', {
          theMovie: res.data
        })
      } catch (error) {
        commit('updateState', {
          theMovie: {}
        })
      } finally {
        commit('updateState', {
          loading: false
        })
      }
    }
  }
}

async function _fetchMovie(payload) {
  return await axios.post('/.netlify/functions/movie', payload)
}