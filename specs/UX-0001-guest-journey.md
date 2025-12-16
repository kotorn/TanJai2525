# UX-0001: Guest Journey Map (Zero-Friction)

**Owner:** Empathy
**Status:** DRAFT

## Objective
Visualize the "3-Click Flow" and ensure no barriers (like Login) exist.

## The Journey (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> ScanQR: 🤳 User Scans Table QR
    
    state "Smart Loading" as Load {
        ScanQR --> ReadCookie: Middleware Check
        ReadCookie --> ContextFound: Cookie Exists?
        ReadCookie --> RedirectAuth: No Cookie (or Invalid)
        RedirectAuth --> ContextFound: Auto-Guest Login
    }

    state "Browsing (Midnight Menu)" as Browse {
        ContextFound --> ViewSmartMenu: Show Context Header
        ViewSmartMenu --> AddItem: 👆 Click 1 (Add)
        AddItem --> UpdateCart: Animation & Vibrations
    }

    state "Checkout (Drawer)" as Pay {
        UpdateCart --> OpenDrawer: 👆 Click 2 (View Order)
        OpenDrawer --> ConfirmOrder: 👆 Click 3 (Send to Kitchen)
        ConfirmOrder --> API_Submit: Fingerprint & Token
    }

    state "Waiting" as Wait {
        API_Submit --> TrackingPage: Success
        TrackingPage --> [*]: Food Served
    }

    note right of RedirectAuth
        "Critical: Do not ask for Email/Phone here.
        Just assign a UUID."
    end note
```

## Key Metrics (Drop-off Prevention)
1.  **Load Time**: Must be < 1.5s (PWA Cache).
2.  **Input Fields**: Target = 0 (Zero inputs required to order).
