// NotificationItem.test.js
import { render, screen } from "@testing-library/react";
import { NotificationItem } from "./NotificationItem"; // Update with the correct path to the component

describe("NotificationItem", () => {
  test("displays the notification message correctly", () => {
    const testMessage = "This is a test notification";
    const testId = 12345;

    render(<NotificationItem id={testId} message={testMessage} />);

    const messageElement = screen.getByText(testMessage);

    expect(messageElement).toBeInTheDocument();
  });

  test("renders with the correct styles", () => {
    render(<NotificationItem id={12345} message="Test notification" />);

    const notificationBox = screen.getByText("Test notification");

    expect(notificationBox).toHaveStyle("background-color: lightgray");
    expect(notificationBox).toHaveStyle("padding: 15px");
    expect(notificationBox).toHaveStyle("border-radius: 5px");
    expect(notificationBox).toHaveStyle("border: 1px solid darkgray");
  });
});
