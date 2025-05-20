import jest from "jest"
import "@testing-library/jest-dom"

// Mock the next/router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock the environment variables
process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY = "test-api-key"

// Mock canvas for charts
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  closePath: jest.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    ok: true,
  }),
)

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor() {
    setTimeout(() => {
      if (this.onopen) this.onopen({})
    }, 0)
  }
  send = jest.fn()
  close = jest.fn()
  addEventListener = jest.fn((event, callback) => {
    if (event === "open") this.onopen = callback
    if (event === "message") this.onmessage = callback
    if (event === "close") this.onclose = callback
    if (event === "error") this.onerror = callback
  })
  removeEventListener = jest.fn()
  onopen = null
  onmessage = null
  onclose = null
  onerror = null
  readyState = 1
  OPEN = 1
}

// Mock Worker
class MockWorker {
  constructor() {
    this.onmessage = null
  }
  postMessage = jest.fn()
  terminate = jest.fn()
}

global.Worker = MockWorker

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url")
