/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"

import { localStorageMock } from "../__mocks__/localStorage.js";
// import store from "../app/Store.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

import NewBillUI from '../views/NewBillUI.js';

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
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
      document.body.innerHTML = BillsUI({data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      const store = null
      const bill = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
    
      const iconEye = screen.getAllByTestId(`icon-eye`)[0]
      /**
       * check for if the modal jQuery method is here before calling it to avoid error:
       * "TypeError: $(...).modal is not a function"
       */
      $.fn.modal = jest.fn()
      
      const handleClickIconEye = jest.fn(()=>bill.handleClickIconEye(iconEye))
      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)
      
      expect(handleClickIconEye).toHaveBeenCalled()
      
      expect($.fn.modal).toHaveBeenCalled()
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
  
  describe("when run error occures API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      //localStorage.setItem('user', JSON.stringify({
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
        window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
 
})