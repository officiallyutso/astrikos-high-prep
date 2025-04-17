using UnityEngine;

public class CameraController : MonoBehaviour
{
    public float moveSpeed = 10f;
    public float rotationSpeed = 3f;
    public float zoomSpeed = 20f;
    public float minZoom = 10f;
    public float maxZoom = 80f;

    private Vector3 lastMousePos;

    private void Update()
    {
        HandleMovement();
        HandleRotation();
        HandleZoom();
    }

    void HandleMovement()
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        Vector3 direction = new Vector3(h, 0, v).normalized;
        transform.Translate(direction * moveSpeed * Time.deltaTime, Space.Self);
    }

    void HandleRotation()
    {
        if (Input.GetMouseButtonDown(1))
        {
            lastMousePos = Input.mousePosition;
        }

        if (Input.GetMouseButton(1))
        {
            Vector3 delta = Input.mousePosition - lastMousePos;
            float angle = delta.x * rotationSpeed * Time.deltaTime;

            transform.Rotate(Vector3.up, angle, Space.World);
            lastMousePos = Input.mousePosition;
        }
    }

    void HandleZoom()
    {
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        Camera cam = GetComponentInChildren<Camera>();

        if (cam != null)
        {
            float fov = cam.fieldOfView;
            fov -= scroll * zoomSpeed;
            fov = Mathf.Clamp(fov, minZoom, maxZoom);
            cam.fieldOfView = fov;
        }
    }
}
