/**
 * @jest-environment jsdom
 */
import React from 'react'
import userEvent from '@testing-library/user-event'
import {localStorageMock} from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import store from "../app/Store.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";

import { fireEvent, screen , act, waitFor, createEvent, wait} from "@testing-library/dom"
import { render } from "@testing-library/react";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // initialisation navigation
    
    test('I change the file', async () => {
      const onNavigate = null
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })   
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const newbill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const file = new File(['billet-cartonne-sncf'], "billet-cartonne-sncf.jpg", {type: "image/png"})
      const fileExt = file.name.split('.')[file.name.split('.').length -1]

      const authExtensions = ['jpg', 'jpeg', 'png']
      const handleChangeFile = jest.fn((e) => newbill.handleChangeFile(e))

      //const { getByTestId } = new render(<NewBillUI />);
      const submit = screen.getByTestId('btn-send-bill')
      const testedFile = screen.getByTestId("file")
      testedFile.addEventListener('change', handleChangeFile)
      
      userEvent.upload(testedFile, file)
      expect(testedFile.files[0]).toBe(file)
      expect(handleChangeFile).toHaveBeenCalled()
      /*if (authExtensions.includes(fileExt)) {
        expect(submit.hasAttribute('disabled')).toBe(false)
      }*/
    })
    test('Then onclick on submit should call handlesubmit', async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //const onNavigate = null
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newbill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      //const { getByTestId } = new render(<NewBillUI />);
      const submit = screen.getByTestId('btn-send-bill')
      const form = screen.getByTestId('form-new-bill')
      const testedFile = screen.getByTestId("file")
      const file = new File(['billet-cartonne-sncf'], "billet-cartonne-sncf.xbm", {type: "image/bitmap"})
      const bill = {
        email: 'employee@test.tld',
        type: screen.getByTestId("expense-type").value,
        name:  screen.getByTestId("expense-name").value,
        amount: parseInt(screen.getByTestId("amount").value),
        date:  screen.getByTestId("datepicker").value,
        vat: screen.getByTestId("vat").value,
        pct: parseInt(screen.getByTestId("pct").value) || 20,
        commentary: screen.getByTestId("commentary").value,
        fileUrl: file.pathname,
        fileName: file.name,
        status: 'pending'
      }
      const handlesubmit = jest.fn((e) => newbill.handleSubmit(e))
      const handleChangeFile = jest.fn((e) => newbill.handleChangeFile(e))
      //const updatebill = jest.fn((e) => newbill.updateBill(bill))
      testedFile.addEventListener('change', handleChangeFile)
      form.addEventListener('submit', handlesubmit)
      userEvent.upload(testedFile, file)
      
      expect(handleChangeFile).toHaveBeenCalled()
      //expect(submit.disabled).toBe(true)
      fireEvent.submit(form)
      expect(handlesubmit).toHaveBeenCalled()
      //expect(updatebill).toHaveBeenCalled()
    })
  })
})
