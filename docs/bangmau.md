## Bảng màu đầy đủ

| STT | Mã HEX | Mã RGB / RGBA | Tên màu | Nơi sử dụng |
|-----|--------|---------------|---------|-------------|
| 1 | `#D32F2F` | `rgb(211, 47, 47)` | Đỏ tươi đậm | `color` của `h2`, `.forgot-pwd`, `.register-text a`; `border-color` khi input focus; `--primary-red` |
| 2 | `#9A0007` | `rgb(154, 0, 7)` | Đỏ thẫm / Đỏ tối | Điểm cuối `linear-gradient` của `.btn-login`, `.right-panel`; `--dark-red` |
| 3 | `#FF6659` | `rgb(255, 102, 89)` | Đỏ cam / San hô | Điểm đầu `linear-gradient` của `.btn-login`, `.right-panel`; `--light-red` |
| 4 | `#FDF3F4` | `rgb(253, 243, 244)` | Hồng rất nhạt / Trắng hơi hồng | `background-color` của `body`; `--bg-color` |
| 5 | `#333333` | `rgb(51, 51, 51)` | Xám đen / Gần đen | Màu chữ chính toàn trang; `--text-main` |
| 6 | `#888888` | `rgb(136, 136, 136)` | Xám trung bình | `color` của subtitle, label, register-text; `--text-muted` |
| 7 | `#E0E0E0` | `rgb(224, 224, 224)` | Xám nhạt / Bạc | `border` của ô input; `--border-color` |
| 8 | `#FFFFFF` | `rgb(255, 255, 255)` | Trắng | `background` của `.login-container`; `color` của `.btn-login`, `.right-panel` |
| 9 | `#555555` | `rgb(85, 85, 85)` | Xám đậm | `color` của icon `.top-controls` |
| 10 | `#AAAAAA` | `rgb(170, 170, 170)` | Xám bạc | `color` của icon mắt `.eye-icon` |
| 11 | *(RGBA)* | `rgba(154, 0, 7, 0.15)` | Đỏ tối, 15% mờ | `box-shadow` của `.login-container` |
| 12 | *(RGBA)* | `rgba(211, 47, 47, 0.3)` | Đỏ tươi, 30% mờ | `box-shadow` hover của `.btn-login` |
| 13 | *(RGBA)* | `rgba(255, 255, 255, 0.05)` | Trắng, 5% mờ | `background` của `.blob-1`, `.blob-2` |
| 14 | *(RGBA)* | `rgba(255, 255, 255, 0.2)` | Trắng, 20% mờ | `background` của `.logo-box` |
| 15 | *(RGBA)* | `rgba(255, 255, 255, 0.3)` | Trắng, 30% mờ | `border` của `.logo-box` |


## CSS Variables (`:root`)

```css
:root {
    --primary-red:  #D32F2F;   /* Đỏ chính */
    --dark-red:     #9A0007;   /* Đỏ tối cho gradient */
    --light-red:    #FF6659;   /* Đỏ sáng cho gradient */
    --bg-color:     #FDF3F4;   /* Nền web hơi ám đỏ nhạt */
    --text-main:    #333333;   /* Văn bản chính */
    --text-muted:   #888888;   /* Văn bản phụ / mờ */
    --border-color: #E0E0E0;   /* Viền ô input */
}
'''

> **Lưu ý:** Các màu RGBA (STT 11–15) có kênh alpha nên không chuyển đổi sang HEX 6 ký tự được.  
> Nếu cần HEX 8 ký tự (CSS Color Level 4):  
> - `rgba(154,0,7,0.15)` → `#9A000726`  
> - `rgba(211,47,47,0.3)` → `#D32F2F4D`  
> - `rgba(255,255,255,0.05)` → `#FFFFFF0D`  
> - `rgba(255,255,255,0.2)` → `#FFFFFF33`  
> - `rgba(255,255,255,0.3)` → `#FFFFFF4D`
