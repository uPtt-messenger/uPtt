開發者文件
###########

這裡是 uPtt_ 的開發者文件，使用 Sphinx_ 產生。

.. _uPtt: https://uptt.cc
.. _Sphinx: http://sphinx-doc.org/

專案架構
----------

| 這個專案的架構設計旨在將系統模組化，以便易於維護和擴展。各個元件的功能和責任如下：

* PTT backend: 負責處理與批踢踢伺服器的通訊，包括登入、獲取文章列表、發送文章等操作。
* MQ server: 提供消息佇列服務，用於元件之間的非同步通訊，實現解耦和增加系統的彈性。
* System tray: 顯示系統列圖示，提供用戶快速使用系統功能的表單。
* Chat window: 用戶之間的即時聊天界面。
* Login window: 用於用戶登入批踢踢帳號的界面。

| 這是目前的專案架構。五個元件分散在 frontend_ 和 backend_ 兩個 repo 中，但未來希望可以各自獨立成一個 repo 管理。

.. _frontend: https://github.com/uPtt-messenger/frontend
.. _backend: https://github.com/uPtt-messenger/backend

.. graphviz::
    :name: repo structure
    :caption: 專案架構
    :alt: How Sphinx and GraphViz Render the Final Document
    :align: center

    digraph Architecture {
        node [shape=box, style=rounded];
        rankdir=TB; // 垂直布局

        subgraph cluster_uPtt {
            label="uPtt";
            node [style=filled, color=lightgray];
            PTT_backend [label="PTT\nbackend"];
            MQ_server [label="MQ\nserver"];
            system_tray [label="system\ntray"];
            chat_window [label="chat\nwindow"];
            login_window [label="login\nwindow"];
        }

        subgraph cluster_backend {
            label="Backend";
            node [style=filled, color=lightgreen];
            PTT_backend_ext [label="PTT\nbackend"];
            MQ_server_ext [label="MQ\nserver"];
            system_tray_ext [label="system\ntray"];
        }

        subgraph cluster_frontend {
            label="Frontend";
            node [style=filled, color=orange];
            chat_window_ext [label="chat\nwindow"];
            login_window_ext [label="login\nwindow"];
        }

        // Backend connections
        PTT_backend_ext -> PTT_backend;
        MQ_server_ext -> MQ_server;
        system_tray_ext -> system_tray;

        // Frontend connections
        chat_window_ext -> chat_window;
        login_window_ext -> login_window;
    }

| 未來希望可以朝每個元件都獨立管理的方向前進。

.. graphviz::
    :name: new repo structure
    :caption: 未來專案架構
    :alt: How Sphinx and GraphViz Render the Final Document
    :align: center

    digraph Architecture {
        node [shape=box, style=rounded, fontcolor=black];
        rankdir=TB; // 垂直布局

        subgraph cluster_uPtt {
            label="uPtt";
            node [style=filled];
            PTT_backend [label="PTT\nbackend", color=palegreen];
            MQ_server [label="MQ\nserver", color=khaki];
            system_tray [label="system\ntray", color=lightskyblue];
            chat_window [label="chat\nwindow", color=sandybrown];
            login_window [label="login\nwindow", color=lightpink];
        }

        PTT_backend_ext [label="PTT\nbackend", style=filled, color=palegreen];
        MQ_server_ext [label="MQ\nserver", style=filled, color=khaki];
        system_tray_ext [label="system\ntray", style=filled, color=lightskyblue];
        chat_window_ext [label="chat\nwindow", style=filled, color=sandybrown];
        login_window_ext [label="login\nwindow", style=filled, color=lightpink];

        // Backend connections
        PTT_backend_ext -> PTT_backend;
        MQ_server_ext -> MQ_server;
        system_tray_ext -> system_tray;

        // Frontend connections
        chat_window_ext -> chat_window;
        login_window_ext -> login_window;
    }

Message queue
--------------

採用 Message queue 架構是為了實現元件之間的非同步通訊並帶來以下優勢：

* 技術堆疊靈活：不同元件之間可以自由採用不同的技術堆疊，如程式語言、框架等。
* 方便替換：同一個功能的元件，可以由不同開發者各自開發，當目前採用的開發者無法持續開發時，可由熟悉不同技術的開發者開發功能相同的元件。

.. graphviz::
    :name: Message queue structure
    :caption: Message queue structure
    :align: center

    digraph Architecture {
        node [shape=box, style=rounded];

        "Message Queue" [shape=rect, style=filled, width=6.5];

        PTT_backend [label="PTT\nbackend", style=filled, color=palegreen];
        MQ_server [label="MQ\nserver", style=filled, color=khaki];
        system_tray [label="system\ntray", style=filled, color=lightskyblue];
        chat_window [label="chat\nwindow", style=filled, color=sandybrown];
        login_window [label="login\nwindow", style=filled, color=lightpink];

        PTT_backend -> "Message Queue";
        MQ_server -> "Message Queue";
        system_tray -> "Message Queue";
        login_window -> "Message Queue";
        chat_window -> "Message Queue";
    }

| 目前 Message queue server 是自行開發的簡單實作，使用了 FastAPI_ 作為 web framework。
| 其中有實作了 long polling 機制，所以元件的 API 呼叫可以不用設置時間間隔。

.. _FastAPI: https://fastapi.tiangolo.com/

Channels
-----------

| Channels 是用來區分不同元件之間的通訊頻道，每個元件都需要訂閱自己的 channel 以接收別的元件傳送過來的訊息，並且可以藉由發送訊息到指定的 channel 來傳送訊息給其他元件。

.. graphviz::
    :name: Channels
    :caption: Channels
    :align: center

    digraph Channels {
        node [shape=box, style=rounded];

        "PTT backend" [label="PTT\nbackend", style=filled, color=palegreen];
        "MQ server" [label="MQ\nserver", style=filled, color=khaki];
        "system tray" [label="system\ntray", style=filled, color=lightskyblue];
        "chat window" [label="chat\nwindow", style=filled, color=sandybrown];
        "login window" [label="login\nwindow", style=filled, color=lightpink];

        "to_ptt_backend" [label="to_ptt_backend", shape=rect, style=filled, color=palegreen];
        "to_mq_server" [label="to_mq_server", shape=rect, style=filled, color=khaki];
        "to_system_tray" [label="to_system_tray", shape=rect, style=filled, color=lightskyblue];
        "to_chat_window" [label="to_chat_window", shape=rect, style=filled, color=sandybrown];
        "to_login_window" [label="to_login_window", shape=rect, style=filled, color=lightpink];

        "Message Queue" [shape=circle, style=filled, width=2, fillcolor=lightgray];

        "PTT backend" -> "to_ptt_backend" [dir=back];
        "MQ server" -> "to_mq_server" [dir=back];
        "system tray" -> "to_system_tray" [dir=back];
        "login window" -> "to_login_window" [dir=back];
        "chat window" -> "to_chat_window" [dir=back];

        "to_ptt_backend" -> "Message Queue" [dir=both];
        "to_mq_server" -> "Message Queue" [dir=both];
        "to_system_tray" -> "Message Queue" [dir=both];
        "to_login_window" -> "Message Queue" [dir=both];
        "to_chat_window" -> "Message Queue" [dir=both];
    }


發送訊息
^^^^^^^^
| 以下是發送訊息的示範程式。
| 先介紹一下發送訊息的基本格式。
| 必須要有 `channel` 你要把訊息發送給哪一個頻道，把你要打包的訊息放到 `message` 底下，記得也要放入怎麼回訊息給你的 `reply_channel`。

.. code-block:: text

    {
        "channel": "the channel you want to send",
        "message": "{ ... Your msg here ... "reply_channel": "the channel you can receive"}"
    }

請注意，message 中的 json 訊息有被打包成字串的形式。

接著就是發送訊息。

.. code-block:: python

    response = requests.post("http://127.0.0.1:16180//push/", json=msg)

接收訊息
^^^^^^^^
| 以下是收取訊息的示範程式。
| 其中 timeout 是 5 + 1 秒是因為 long polling 目前設定在 5 秒，所以 request timeout 時間才會設定在 5 + 1 秒。
| 而 Message queue server 有實作了 long polling 機制，所以元件的呼叫可以不用設置 sleep。
| 如果沒有訊息，就會等待 5 秒再回覆沒有訊息。

.. code-block:: python

    params = {
        "channel": "the channel you want to receive"
    }

    while True:
        response = requests.get(
            "http://127.0.0.1:16180/pull/",
            json=params,
            timeout=5 + 1)

實際用來接收訊息的程式碼你可以在 receive_message_forever_ 找到。

.. _receive_message_forever: https://github.com/uPtt-messenger/backend/blob/develop/src/mq.py#L41-L62

那實際收到的訊息都會是以矩陣的形式並按照時間排序。

程式碼流程
------------

登入
^^^^^^^

這裡將描述登入溝通的過程。

1. 使用者在 Login Window 輸入批踢踢帳號和密碼後，Login Window 將透過 Message queue server 發送登入訊息給 PTT backend，請求執行登入操作。

.. code-block:: json

    {
        "channel": "to_backend",
        "message": "{\"category\": \"login\", \"username\": \"PTT ID\", \"password\": \"PTT PW\", \"reply_channel\": \"to_ui\"}"
    }

2. PTT backend 收到登入訊息後，執行登入操作並將結果發送回 UI 元件，報告登入成功或失敗。

以剛剛 PTT backend 收到的訊息為例，取得的登入訊息，應該會長這樣。

.. code-block:: json

    {
        "messages": [
            {"category": "login", "username": "PTT ID", "password": "PTT PW", "reply_channel": "to_ui"}
        ]
    }

執行登入之後，PTT backend 理當會回覆兩種訊息，登入成功與登入失敗。

以下是登入成功的範例訊息。

.. code-block:: json

    {
        "messages": [
            {"category": "status", "action": "login", "state": "SUCCESS", "message": "login success", "reply_channel": "to_backend"}
        ]
    }

以下是登入失敗的範例訊息。

.. code-block:: json

    {
        "messages": [
            {"category": "status", "action": "login", "state": "FAILURE", "message": "wrong id or password", "reply_channel": "to_backend"}
        ]
    }

至此，整個登入流程就算完成了。

登出
^^^^^^^

如果成功登入了，那麼登出的流程就會是這樣。

1. 使用者在點選登出後，UI 發送登出訊息給 PTT backend，請求執行登出操作。

.. code-block:: json

    {
        "channel": "to_backend",
        "message": "{\"category\": \"logout\", \"reply_channel\": \"to_ui\"}"
    }