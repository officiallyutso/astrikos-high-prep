using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.EventSystems;

public class GridBuilder : MonoBehaviour
{
    // Prefab management
    public GameObject[] shapes;
    public float gridSize = 1f;
    private int currentShape = 0;

    // Move mode UI
    public Button moveModeButton;
    public Color moveOnColor = Color.cyan;
    public Color moveOffColor = Color.gray;
    private bool moveMode = false;

    // Shape selection UI
    public Button[] shapeButtons;
    public Color selectedColor = Color.cyan;
    public Color defaultColor = Color.white;

    // Scale mode UI
    public Button scaleModeButton;
    public GameObject scalePanel;
    public TMP_InputField inputX;
    public TMP_InputField inputY;
    public TMP_InputField inputZ;
    public Color scaleOnColor = Color.cyan;
    public Color scaleOffColor = Color.gray;
    private bool scaleMode = false;

    // Internal references
    private PlaneController planeController;
    private GameObject selectedBlock;

    void Start()
    {
        planeController = FindObjectOfType<PlaneController>();
        HighlightSelectedButton();
        // Initialize move and scale button colors
        if (moveModeButton) ToggleMoveMode(); ToggleMoveMode();
        if (scaleModeButton) ToggleScaleMode(); ToggleScaleMode();
    }

    void Update()
    {
        // Keyboard: shape shortcuts
        if (Input.GetKeyDown(KeyCode.Alpha1)) SetShape(0);
        if (Input.GetKeyDown(KeyCode.Alpha2)) SetShape(1);
        if (Input.GetKeyDown(KeyCode.Alpha3)) SetShape(2);

        // Toggle modes
        if (Input.GetKeyDown(KeyCode.M)) ToggleMoveMode();
        if (Input.GetKeyDown(KeyCode.S)) ToggleScaleMode();

        // World interactions only when not over UI
        if (!EventSystem.current.IsPointerOverGameObject())
        {
            if (Input.GetMouseButtonDown(0))
            {
                if (moveMode)
                    TrySelectBlockToMove();
                else if (scaleMode)
                    TrySelectBlockToScale();
                else
                    TryPlaceBlock();
            }
            if (Input.GetMouseButtonDown(1))
                TryDeleteBlock();
        }

        // Drag movement is continuous
        if (moveMode && selectedBlock != null)
            DragSelectedBlock();
    }

    // PLACE
    void TryPlaceBlock()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        if (Physics.Raycast(ray, out RaycastHit hit))
        {
            Vector3 spawnPos = SnapToGrid(hit.point);
            if (planeController.IsPointInside4x4(spawnPos))
                Instantiate(shapes[currentShape], spawnPos, Quaternion.identity).tag = "Placed";
        }
    }
    public void SetMoveMode(bool value) { moveMode = value; /* update UI if needed */ }
    public void SetScaleMode(bool value) { scaleMode = value; /* show scale panel only when active */ }

    // DELETE
    void TryDeleteBlock()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        if (Physics.Raycast(ray, out RaycastHit hit))
        {
            if (hit.transform.CompareTag("Placed"))
                Destroy(hit.transform.gameObject);
        }
    }

    // MOVE
    public void ToggleMoveMode()
    {
        moveMode = !moveMode;
        if (moveModeButton)
        {
            var cb = moveModeButton.colors;
            cb.normalColor = moveMode ? moveOnColor : moveOffColor;
            moveModeButton.colors = cb;
        }
    }

    void TrySelectBlockToMove()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        if (Physics.Raycast(ray, out RaycastHit hit) && hit.transform.CompareTag("Placed"))
            selectedBlock = hit.transform.gameObject;
    }

    void DragSelectedBlock()
    {
        if (!Input.GetMouseButton(0)) return;
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        if (Physics.Raycast(ray, out RaycastHit hit))
        {
            Vector3 newPos = SnapToGrid(hit.point);
            if (planeController.IsPointInside4x4(newPos))
                selectedBlock.transform.position = newPos;
        }
    }

    // SCALE
    public void ToggleScaleMode()
    {
        scaleMode = !scaleMode;
        scalePanel.SetActive(false);
        if (scaleModeButton)
        {
            var cb = scaleModeButton.colors;
            cb.normalColor = scaleMode ? scaleOnColor : scaleOffColor;
            scaleModeButton.colors = cb;
        }
    }

    void TrySelectBlockToScale()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        if (Physics.Raycast(ray, out RaycastHit hit) && hit.transform.CompareTag("Placed"))
        {
            selectedBlock = hit.transform.gameObject;
            Vector3 local = selectedBlock.transform.localScale;
            inputX.text = (local.x / 4f).ToString();
            inputY.text = (local.y / 4f).ToString();
            inputZ.text = (local.z / 4f).ToString();
            scalePanel.SetActive(true);
        }
    }

    public void ApplyScale()
    {
        if (selectedBlock == null) return;

        float x = float.Parse(inputX.text);
        float y = float.Parse(inputY.text);
        float z = float.Parse(inputZ.text);

        // Allow up to plane width/4 for X and plane height/4 for Z
        float maxX = (planeController.GetWidth() -6)/ 4f;
        float maxZ = (planeController.GetHeight()-6) / 4f;

        x = Mathf.Clamp(x, 1f, maxX);
        z = Mathf.Clamp(z, 1f, maxZ);
        y = Mathf.Max(1f, y);

        selectedBlock.transform.localScale = new Vector3(x * 4f, y * 4f, z * 4f);
        scalePanel.SetActive(false);
    }

    // SHAPE SELECTION
    public void SetShape(int index)
    {
        if (index >= 0 && index < shapes.Length)
        {
            currentShape = index;
            HighlightSelectedButton();
        }
    }

    void HighlightSelectedButton()
    {
        for (int i = 0; i < shapeButtons.Length; i++)
        {
            var cb = shapeButtons[i].colors;
            cb.normalColor = (i == currentShape) ? selectedColor : defaultColor;
            shapeButtons[i].colors = cb;
        }
    }

    Vector3 SnapToGrid(Vector3 point)
    {
        return new Vector3(
            Mathf.Round(point.x / gridSize) * gridSize,
            Mathf.Round(point.y / gridSize) * gridSize,
            Mathf.Round(point.z / gridSize) * gridSize
        );
    }
}
