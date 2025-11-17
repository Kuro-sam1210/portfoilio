#include <windows.h>
#include <d3d11.h>
#include <dxgi.h>
#include <wincodec.h>
#include <d3dcompiler.h>
#include <commdlg.h>
#include <vector>
#include <DirectXColors.h>

#pragma comment(lib, "d3d11.lib")
#pragma comment(lib, "dxgi.lib")
#pragma comment(lib, "windowscodecs.lib")
#pragma comment(lib, "d3dcompiler.lib")
#pragma comment(lib, "comdlg32.lib")

using namespace DirectX;
using std::vector;

WCHAR g_filePath[260] = { 0 };

ID3D11Device* g_device = nullptr;
ID3D11DeviceContext* g_context = nullptr;
IDXGISwapChain* g_swapChain = nullptr;

IWICImagingFactory* g_wicFactory = nullptr;
IWICBitmapDecoder* g_decoder = nullptr;
vector<ID3D11Texture2D*> g_textures;
vector<ID3D11ShaderResourceView*> g_srvs;
UINT g_frameCount = 0;
UINT g_currentFrame = 0;

ID3D11VertexShader* g_vertexShader = nullptr;
ID3D11PixelShader* g_pixelShader = nullptr;
ID3D11Buffer* g_vertexBuffer = nullptr;
ID3D11InputLayout* g_inputLayout = nullptr;
ID3D11SamplerState* g_sampler = nullptr;
ID3D11ShaderResourceView* g_srv = nullptr;

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
    MessageBox(NULL, L"App started", L"Debug", MB_OK);

    // Register window class
    WNDCLASSEX wc = { sizeof(WNDCLASSEX), CS_HREDRAW | CS_VREDRAW, WndProc, 0, 0, hInstance, NULL, NULL, NULL, NULL, L"LiveWallpaperClass", NULL };
    if (!RegisterClassEx(&wc))
    {
        MessageBox(NULL, L"Failed to register class", L"Error", MB_OK);
        return -1;
    }

    MessageBox(NULL, L"Class registered", L"Debug", MB_OK);

    // Create full-screen window
    int screenWidth = GetSystemMetrics(SM_CXSCREEN);
    int screenHeight = GetSystemMetrics(SM_CYSCREEN);
    WCHAR buf[100];
    wsprintfW(buf, L"Screen size: %d x %d", screenWidth, screenHeight);
    MessageBox(NULL, buf, L"Debug", MB_OK);
    HWND hwnd = CreateWindowEx(WS_EX_TOOLWINDOW, L"LiveWallpaperClass", L"Live Wallpaper", WS_POPUP,
                               0, 0, screenWidth, screenHeight, NULL, NULL, hInstance, NULL);
    if (!hwnd)
    {
        MessageBox(NULL, L"Failed to create window", L"Error", MB_OK);
        return -1;
    }

    MessageBox(NULL, L"Window created", L"Debug", MB_OK);

    // Initialize DirectX
    DXGI_SWAP_CHAIN_DESC swapChainDesc = {};
    swapChainDesc.BufferCount = 1;
    swapChainDesc.BufferDesc.Width = screenWidth;
    swapChainDesc.BufferDesc.Height = screenHeight;
    swapChainDesc.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    swapChainDesc.BufferDesc.RefreshRate.Numerator = 60;
    swapChainDesc.BufferDesc.RefreshRate.Denominator = 1;
    swapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
    swapChainDesc.OutputWindow = hwnd;
    swapChainDesc.SampleDesc.Count = 1;
    swapChainDesc.SampleDesc.Quality = 0;
    swapChainDesc.Windowed = TRUE;

    D3D_FEATURE_LEVEL featureLevel;
    HRESULT hr = D3D11CreateDeviceAndSwapChain(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, 0, nullptr, 0, D3D11_SDK_VERSION, &swapChainDesc, &g_swapChain, &g_device, &featureLevel, &g_context);
    if (FAILED(hr)) {
        MessageBox(NULL, L"Failed to create DirectX device and swap chain", L"Error", MB_OK);
        return -1;
    }

    MessageBox(NULL, L"DirectX initialized", L"Debug", MB_OK);

    // Initialize WIC
    CoInitializeEx(NULL, COINIT_MULTITHREADED);
    CoCreateInstance(CLSID_WICImagingFactory, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&g_wicFactory));

    MessageBox(NULL, L"WIC initialized", L"Debug", MB_OK);

    // Get command line args
    int argc;
    LPWSTR* argv = CommandLineToArgvW(GetCommandLineW(), &argc);
    if (argc > 1) {
        wcscpy_s(g_filePath, argv[1]);
    } else {
        MessageBox(NULL, L"About to show file dialog", L"Debug", MB_OK);
        // Show file dialog
        OPENFILENAME ofn = { sizeof(OPENFILENAME) };
        ofn.lpstrFile = g_filePath;
        ofn.nMaxFile = sizeof(g_filePath) / sizeof(WCHAR);
        ofn.lpstrFilter = L"GIF Files\0*.gif\0All Files\0*.*\0";
        ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST;
        if (!GetOpenFileName(&ofn)) {
            MessageBox(NULL, L"File dialog canceled", L"Info", MB_OK);
            LocalFree(argv);
            return 0; // User canceled
        }
        MessageBox(NULL, L"File selected", L"Debug", MB_OK);
    }
    LocalFree(argv);

    // Load GIF
    hr = g_wicFactory->CreateDecoderFromFilename(g_filePath, nullptr, GENERIC_READ, WICDecodeMetadataCacheOnLoad, &g_decoder);
    if (FAILED(hr)) {
        MessageBox(NULL, L"Failed to load GIF file", L"Error", MB_OK);
        return -1;
    }

    g_decoder->GetFrameCount(&g_frameCount);
    for (UINT i = 0; i < g_frameCount; i++) {
        IWICBitmapFrameDecode* frame = nullptr;
        g_decoder->GetFrame(i, &frame);
        IWICFormatConverter* converter = nullptr;
        g_wicFactory->CreateFormatConverter(&converter);
        converter->Initialize(frame, GUID_WICPixelFormat32bppRGBA, WICBitmapDitherTypeNone, nullptr, 0.0f, WICBitmapPaletteTypeCustom);

        UINT width, height;
        converter->GetSize(&width, &height);
        UINT stride = width * 4;
        BYTE* data = new BYTE[height * stride];
        converter->CopyPixels(nullptr, stride, height * stride, data);

        D3D11_TEXTURE2D_DESC texDesc = {};
        texDesc.Width = width;
        texDesc.Height = height;
        texDesc.MipLevels = 1;
        texDesc.ArraySize = 1;
        texDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
        texDesc.SampleDesc.Count = 1;
        texDesc.Usage = D3D11_USAGE_DEFAULT;
        texDesc.BindFlags = D3D11_BIND_SHADER_RESOURCE;

        D3D11_SUBRESOURCE_DATA initData = {};
        initData.pSysMem = data;
        initData.SysMemPitch = stride;

        ID3D11Texture2D* texture = nullptr;
        g_device->CreateTexture2D(&texDesc, &initData, &texture);
        g_textures.push_back(texture);

        ID3D11ShaderResourceView* srv = nullptr;
        g_device->CreateShaderResourceView(texture, nullptr, &srv);
        g_srvs.push_back(srv);

        delete[] data;
        converter->Release();
        frame->Release();
    }

    if (!g_srvs.empty()) g_srv = g_srvs[0];
    LocalFree(argv);

    MessageBox(NULL, L"GIF loaded successfully, starting wallpaper", L"Info", MB_OK);

    // Create shaders
    const char* vsCode = R"(
    struct VS_INPUT {
        float4 pos : POSITION;
        float2 tex : TEXCOORD;
    };
    struct PS_INPUT {
        float4 pos : SV_POSITION;
        float2 tex : TEXCOORD;
    };
    PS_INPUT main(VS_INPUT input) {
        PS_INPUT output;
        output.pos = input.pos;
        output.tex = input.tex;
        return output;
    }
    )";

    ID3DBlob* vsBlob = nullptr;
    D3DCompile(vsCode, strlen(vsCode), nullptr, nullptr, nullptr, "main", "vs_4_0", 0, 0, &vsBlob, nullptr);
    g_device->CreateVertexShader(vsBlob->GetBufferPointer(), vsBlob->GetBufferSize(), nullptr, &g_vertexShader);

    D3D11_INPUT_ELEMENT_DESC layout[] = {
        { "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, 0, D3D11_INPUT_PER_VERTEX_DATA, 0 },
        { "TEXCOORD", 0, DXGI_FORMAT_R32G32_FLOAT, 0, 12, D3D11_INPUT_PER_VERTEX_DATA, 0 }
    };
    g_device->CreateInputLayout(layout, 2, vsBlob->GetBufferPointer(), vsBlob->GetBufferSize(), &g_inputLayout);
    vsBlob->Release();

    const char* psCode = R"(
    Texture2D tex : register(t0);
    SamplerState samp : register(s0);
    float4 main(float4 pos : SV_POSITION, float2 tex : TEXCOORD) : SV_TARGET {
        return tex.Sample(samp, tex);
    }
    )";

    ID3DBlob* psBlob = nullptr;
    D3DCompile(psCode, strlen(psCode), nullptr, nullptr, nullptr, "main", "ps_4_0", 0, 0, &psBlob, nullptr);
    g_device->CreatePixelShader(psBlob->GetBufferPointer(), psBlob->GetBufferSize(), nullptr, &g_pixelShader);
    psBlob->Release();

    struct Vertex {
        float x, y, z;
        float u, v;
    };
    Vertex vertices[] = {
        { -1.0f,  1.0f, 0.0f, 0.0f, 0.0f },
        {  1.0f,  1.0f, 0.0f, 1.0f, 0.0f },
        { -1.0f, -1.0f, 0.0f, 0.0f, 1.0f },
        {  1.0f, -1.0f, 0.0f, 1.0f, 1.0f }
    };
    D3D11_BUFFER_DESC bufferDesc = {};
    bufferDesc.Usage = D3D11_USAGE_DEFAULT;
    bufferDesc.ByteWidth = sizeof(vertices);
    bufferDesc.BindFlags = D3D11_BIND_VERTEX_BUFFER;
    D3D11_SUBRESOURCE_DATA initData = {};
    initData.pSysMem = vertices;
    g_device->CreateBuffer(&bufferDesc, &initData, &g_vertexBuffer);

    D3D11_SAMPLER_DESC sampDesc = {};
    sampDesc.Filter = D3D11_FILTER_MIN_MAG_MIP_LINEAR;
    sampDesc.AddressU = D3D11_TEXTURE_ADDRESS_WRAP;
    sampDesc.AddressV = D3D11_TEXTURE_ADDRESS_WRAP;
    sampDesc.AddressW = D3D11_TEXTURE_ADDRESS_WRAP;
    sampDesc.ComparisonFunc = D3D11_COMPARISON_NEVER;
    sampDesc.MinLOD = 0;
    sampDesc.MaxLOD = D3D11_FLOAT32_MAX;
    g_device->CreateSamplerState(&sampDesc, &g_sampler);

    // Position window behind desktop icons
    HWND progman = FindWindow(L"Progman", NULL);
    if (progman) {
        SendMessageTimeout(progman, 0x052C, 0, 0, SMTO_NORMAL, 1000, NULL);
    }

    HWND workerW = nullptr;
    EnumWindows([](HWND hwnd, LPARAM lParam) -> BOOL {
        HWND shellView = FindWindowEx(hwnd, NULL, L"SHELLDLL_DefView", NULL);
        if (shellView) {
            *reinterpret_cast<HWND*>(lParam) = FindWindowEx(NULL, hwnd, L"WorkerW", NULL);
            return FALSE;
        }
        return TRUE;
    }, reinterpret_cast<LPARAM>(&workerW));

    if (workerW) {
        SetParent(hwnd, workerW);
    }

    // Show the window
    ShowWindow(hwnd, SW_SHOW);
    UpdateWindow(hwnd);

    // Set timer for animation
    if (g_frameCount > 1) {
        SetTimer(hwnd, 1, 100, nullptr);
    }

    // Message loop
    MSG msg = { 0 };
    while (GetMessage(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return (int)msg.wParam;
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    switch (msg)
    {
    case WM_TIMER:
        g_currentFrame = (g_currentFrame + 1) % g_frameCount;
        g_srv = g_srvs[g_currentFrame];
        InvalidateRect(hwnd, nullptr, FALSE);
        break;
    case WM_PAINT:
        {
            PAINTSTRUCT ps;
            BeginPaint(hwnd, &ps);
            // Render
            ID3D11Texture2D* backBuffer = nullptr;
            g_swapChain->GetBuffer(0, IID_PPV_ARGS(&backBuffer));
            ID3D11RenderTargetView* rtv = nullptr;
            g_device->CreateRenderTargetView(backBuffer, nullptr, &rtv);
            g_context->OMSetRenderTargets(1, &rtv, nullptr);
            float clearColor[4] = { 0.0f, 0.0f, 0.0f, 1.0f };
            g_context->ClearRenderTargetView(rtv, clearColor);

            if (g_srv) {
                UINT stride = sizeof(float) * 5;
                UINT offset = 0;
                g_context->IASetInputLayout(g_inputLayout);
                g_context->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLESTRIP);
                g_context->IASetVertexBuffers(0, 1, &g_vertexBuffer, &stride, &offset);
                g_context->VSSetShader(g_vertexShader, nullptr, 0);
                g_context->PSSetShader(g_pixelShader, nullptr, 0);
                g_context->PSSetShaderResources(0, 1, &g_srv);
                g_context->PSSetSamplers(0, 1, &g_sampler);
                g_context->Draw(4, 0);
            }

            g_swapChain->Present(1, 0);
            rtv->Release();
            backBuffer->Release();
            EndPaint(hwnd, &ps);
        }
        break;
    case WM_DESTROY:
        KillTimer(hwnd, 1);
        if (g_sampler) g_sampler->Release();
        if (g_vertexBuffer) g_vertexBuffer->Release();
        if (g_inputLayout) g_inputLayout->Release();
        if (g_pixelShader) g_pixelShader->Release();
        if (g_vertexShader) g_vertexShader->Release();
        for (auto srv : g_srvs) if (srv) srv->Release();
        for (auto tex : g_textures) if (tex) tex->Release();
        if (g_decoder) g_decoder->Release();
        if (g_wicFactory) g_wicFactory->Release();
        CoUninitialize();
        if (g_swapChain) g_swapChain->Release();
        if (g_context) g_context->Release();
        if (g_device) g_device->Release();
        PostQuitMessage(0);
        return 0;
    default:
        return DefWindowProc(hwnd, msg, wParam, lParam);
    }
    return 0;
}