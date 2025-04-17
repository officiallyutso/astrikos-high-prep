// Created by: Sunny Valley Studio 
// https://svstudio.itch.io

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace SVS
{
    public class CameraMovement : MonoBehaviour
    {
        public Camera gameCamera;
        public Camera MiniMap;
        public float cameraMovementSpeed = 5f;

        public float maxFieldOfView = 60f, minFieldOfView = 25f;
        public float minOrthographicSize =5,maxOrthographicSize=25;
        public float sensitivity = 10f;

        private void Start()
        {
            gameCamera = GetComponent<Camera>();

            // Ensure the camera is set to Perspective
            gameCamera.orthographic = false;
        }

        public void MoveCamera(Vector3 inputVector)
        {
            // Move in world space with a rotated angle (e.g. angled top-down view)
            var movementVector = Quaternion.Euler(0, 30, 0) * inputVector;
            gameCamera.transform.position += movementVector * Time.deltaTime * cameraMovementSpeed;
        }

        private void Update()
        {
            // Zoom in/out by changing the Field of View
            var scrollInput = Input.GetAxis("Mouse ScrollWheel") * sensitivity;
            gameCamera.fieldOfView = Mathf.Clamp(gameCamera.fieldOfView - scrollInput, minFieldOfView, maxFieldOfView);
            MiniMap.orthographicSize =Mathf.Clamp(MiniMap.orthographicSize - scrollInput, minOrthographicSize, maxOrthographicSize);
        }
    }
}