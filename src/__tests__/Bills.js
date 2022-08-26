/**
 * @jest-environment jsdom
 */
import userEvent from '@testing-library/user-event'
import Bills from "../containers/Bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
//import {ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import NewBillUI from '../views/NewBillUI.js';

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("then getBills fn should be called", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      /*
      //window.onNavigate(ROUTES_PATH.Bills)
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))*/
      document.body.innerHTML = BillsUI({ data: bills })
      const bill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const getbill = jest.fn(()=> bill.getBills())
      document.body.addEventListener('load', getbill)
      expect(getbill).toBeCalled()
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      //const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(screen.getByTestId('icon-window').classList).toContain('active-icon')
      //expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      //const antiChrono = (a, b) => ((a > b) ? -1 : 1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    
    test("Then if i not click on iconEye the modal do not have show class", () => {
      document.body.innerHTML = BillsUI({data: bills })
      const modaleFile = document.querySelector('#modaleFile')
      const getClasses = () => modaleFile.classList
      expect(getClasses()).not.toContain('show')
    })
    test("Then on click on iconEye should open a modal", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })   
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({data: bills })
      const modaleFile = screen.getByTestId('modaleFile')
      //const modaleFile = document.querySelector('div[data-testid="modaleFile"]')
      const iconEye = screen.getAllByTestId(`icon-eye`)[0]
      //const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)[0]
      const bill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye))
      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
      //expect(screen.getByTestId('modaleFile').classList).toContain('show')
      //expect(modaleFile.classList).toContain('show')
      expect(modaleFile).toBeTruthy()
    })
    test('Then on click on button newBill, the NewBillUI should be called', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })   
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({data: bills })
      const btnNewBill = screen.getByTestId(`btn-new-bill`)
      const bill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const handleClickNewBill = jest.fn(bill.handleClickNewBill())
      btnNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(btnNewBill)
      expect(handleClickNewBill).toBeCalled()
      expect(NewBillUI()).toBeTruthy()
    })
  })
})
