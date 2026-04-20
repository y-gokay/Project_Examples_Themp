
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { store } from './redux/app/store.jsx'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import "./main.css"

if (import.meta.env.VITE_USE_MOCK === "true") {
  const { setupMockInterceptors } = await import('./mocks/index.js')
  setupMockInterceptors()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
)
