using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class AddingScaling : MonoBehaviour
{
    public GameObject handleXPrefab;
    public GameObject handleYPrefab;
    public GameObject handleZPrefab;
    private bool Mode_scale=false;
    public Button Scale_Button;
    private Transform selectedObject;
    private Transform handleX, handleY, handleZ;
    private Camera cam;
    private Vector3 initialScale;
    private Vector3 initialMousePos;
    private string activeAxis = "";

    void Start()
    {
        cam = Camera.main;
    }

    void Update()
    {
        HandleSelection();
        HandleScaling();
        if(Input.GetKey(KeyCode.Escape)){
            Mode_scale=false;
            Scale_Button.image.color=new Color(105f/255, 95f/255, 95f/255);
        }
    }
    public void EnableScaleModee(){
        Mode_scale=true;
        Scale_Button.image.color=new Color(150f/255, 152f/255, 200f/255);   
    }
    void HandleSelection()
    {
        if (Input.GetMouseButtonDown(0)&&Mode_scale&&IsPointerOverUIObject() )
        {
            Ray ray = cam.ScreenPointToRay(Input.mousePosition);
            RaycastHit hit;
            if (Physics.Raycast(ray, out hit))
            {
                if (selectedObject != null)
                    DestroyHandles();

                selectedObject = hit.transform;
                CreateHandles();
            }
        }
        if(!Mode_scale){
            DestroyHandles();
        }
    }

    void CreateHandles()
    {
        handleX = Instantiate(handleXPrefab, selectedObject.position, Quaternion.Euler(new Vector3(0,90,0))).transform;
        handleX.SetParent(selectedObject);
        handleX.name = "HandleX";

        handleY = Instantiate(handleYPrefab, selectedObject.position, Quaternion.Euler(new Vector3(-90,0,0))).transform;
        handleY.SetParent(selectedObject);
        handleY.name = "HandleY";

        handleZ = Instantiate(handleZPrefab, selectedObject.position, Quaternion.Euler(new Vector3(0,180,0))).transform;
        handleZ.SetParent(selectedObject);
        handleZ.name = "HandleZ";

        handleX.localPosition = Vector3.right;
        handleY.localPosition = Vector3.up;
        handleZ.localPosition = -Vector3.forward;
    }

    void DestroyHandles()
    {
        foreach (Transform child in selectedObject)
        {
            if (child.name.StartsWith("Handle"))
                Destroy(child.gameObject);
        }
    }

    void HandleScaling()
    {
        if (selectedObject == null) return;

        if (Input.GetMouseButtonDown(0))
        {
            Ray ray = cam.ScreenPointToRay(Input.mousePosition);
            RaycastHit hit;
            if (Physics.Raycast(ray, out hit))
            {
                if (hit.transform.name == "HandleX" || hit.transform.name == "HandleY" || hit.transform.name == "HandleZ")
                {
                    activeAxis = hit.transform.name.Substring("Handle".Length);
                    initialScale = selectedObject.localScale;
                    initialMousePos = Input.mousePosition;
                }
            }
        }

        if (Input.GetMouseButton(0) && activeAxis != "")
        {
            Vector3 delta = Input.mousePosition - initialMousePos;
            float scaleFactor = delta.magnitude * 0.01f;
            scaleFactor *= Mathf.Sign(Vector3.Dot(delta, cam.WorldToScreenPoint(selectedObject.right) - cam.WorldToScreenPoint(selectedObject.position)));

            Vector3 newScale = initialScale;
            if (activeAxis == "X") newScale.x = Mathf.Max(0.1f, initialScale.x + scaleFactor);
            if (activeAxis == "Y") newScale.y = Mathf.Max(0.1f, initialScale.y + scaleFactor);
            if (activeAxis == "Z") newScale.z = Mathf.Max(0.1f, initialScale.z + scaleFactor);

            selectedObject.localScale = newScale;
        }

        if (Input.GetMouseButtonUp(0))
        {
            activeAxis = "";
        }
    }

    // Prevent interaction with UI interfering
    private bool IsPointerOverUIObject()
    {
        return EventSystem.current != null && EventSystem.current.IsPointerOverGameObject();
    }
}
