<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?= style("assets-kit/style.css") ?>
    <title>Re-Sound - Login</title>
</head>
<body class="flex-column align-center justify-center">
    <form action="/login" class="flex-column align-center" method="post">
        <img src="<?= asset("resound.png") ?>" style="max-width: 6em" alt="">
        <label class="form-section">
            <span>Login</span>
            <input type="text" name="login">
        </label>
        <label class="form-section">
            <span>Password</span>
            <input type="password" name="password">
        </label>
        <button class="button blue">Enter</button>
    </form>
</body>
</html>