# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link "QASandbox" [ref=e7] [cursor=pointer]:
        - /url: /
      - generic [ref=e8]:
        - link "Login" [ref=e10] [cursor=pointer]:
          - /url: /login
        - link "Admin" [ref=e12] [cursor=pointer]:
          - /url: /admin-login
    - generic [ref=e15]:
      - generic [ref=e16]: Log In
      - paragraph [ref=e17]: Sign in to your QASandbox account
      - generic [ref=e18]:
        - generic [ref=e21]: Email
        - textbox "Email" [ref=e23]
      - generic [ref=e24]:
        - generic [ref=e27]: Password
        - textbox "Password" [ref=e29]
      - generic [ref=e30]:
        - generic [ref=e31]: Remember me
        - generic [ref=e33]:
          - generic [ref=e34] [cursor=pointer]:
            - generic:
              - img
            - generic:
              - img
          - switch [ref=e36]
      - button "Login" [ref=e37] [cursor=pointer]
      - link "Forgot Password" [ref=e38] [cursor=pointer]:
        - /url: /forgot-password
    - contentinfo [ref=e39]:
      - link "powered by HTEC" [ref=e40] [cursor=pointer]:
        - /url: http://htecgroup.com
        - img "powered by HTEC" [ref=e41]
  - img
```