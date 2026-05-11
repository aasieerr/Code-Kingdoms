Add-Type -AssemblyName System.Drawing

$source = "$PSScriptRoot\image.png"
$img = [System.Drawing.Image]::FromFile($source)
$bmp = New-Object System.Drawing.Bitmap $img
$outDir = "$PSScriptRoot\php"

$bgR=19; $bgG=19; $bgB=32; $tolerance=28

$npcs = @(
    @{name='guardian-del-reino';    x=48;  y=35;  w=142; h=218},
    @{name='mercader-astuto';       x=220; y=58;  w=120; h=195},
    @{name='bibliotecario-real';    x=408; y=43;  w=153; h=210},
    @{name='herrero-de-las-ruinas'; x=36;  y=283; w=128; h=198},
    @{name='maestra-de-blade';      x=186; y=283; w=139; h=198},
    @{name='guardia-de-valet';      x=348; y=283; w=82;  h=198},
    @{name='mercader-del-bazar';    x=438; y=279; w=127; h=202}
)

foreach ($n in $npcs) {
    $outFile = "$outDir\$($n.name).png"
    $srcRect = New-Object System.Drawing.Rectangle($n.x, $n.y, $n.w, $n.h)
    $crop = $bmp.Clone($srcRect, $bmp.PixelFormat)

    $canvas = New-Object System.Drawing.Bitmap 128, 128
    $canvas.SetResolution(96, 96)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::FromArgb(0,0,0,0))

    $scale = [Math]::Min(118.0 / $n.w, 118.0 / $n.h)
    $drawW = [Math]::Max(1, [Math]::Floor($n.w * $scale))
    $drawH = [Math]::Max(1, [Math]::Floor($n.h * $scale))
    $offsetX = [Math]::Floor((128 - $drawW) / 2)
    $offsetY = [Math]::Floor((128 - $drawH) / 2)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $destRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $drawW, $drawH)
    $g.DrawImage($crop, $destRect)
    $g.Dispose()

    # Remove dark background
    for ($y = 0; $y -lt 128; $y++) {
        for ($x = 0; $x -lt 128; $x++) {
            $c = $canvas.GetPixel($x, $y)
            $dr = [Math]::Abs($c.R - $bgR); $dg = [Math]::Abs($c.G - $bgG); $db = [Math]::Abs($c.B - $bgB)
            if ($c.A -gt 0 -and $dr -le $tolerance -and $dg -le $tolerance -and $db -le $tolerance) {
                $canvas.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
            }
        }
    }

    $canvas.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose(); $crop.Dispose()
    Write-Host "Saved: $($n.name).png"
}

$bmp.Dispose(); $img.Dispose()
Write-Host "Done! Background removed."
