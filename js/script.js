
"use strict";

/* =========================================
   JEJAK KEBAIKAN - JAVASCRIPT
   Versi Perbaikan dan Type-Safe
========================================= */

/**
 * @typedef {Object} Message
 * @property {number} id
 * @property {string} nama
 * @property {string} kategori
 * @property {string} isi
 * @property {string} tanggal
 */

/**
 * @typedef {Object} Quote
 * @property {string} text
 * @property {string} author
 */

document.addEventListener("DOMContentLoaded", function () {

  const STORAGE_KEY = "jejakKebaikan";

  /* =====================================
     MENU NAVIGASI
  ===================================== */

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("show");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("show");
      });
    });
  }

  /* =====================================
     DATA PESAN
  ===================================== */

  /**
   * @param {unknown} value
   * @returns {value is Message}
   */
  function isValidMessage(value) {

    if (typeof value !== "object" || value === null) {
      return false;
    }

    const message = /** @type {Record<string, unknown>} */ (value);

    return (
      typeof message.id === "number" &&
      typeof message.nama === "string" &&
      typeof message.kategori === "string" &&
      typeof message.isi === "string" &&
      typeof message.tanggal === "string"
    );
  }

  /**
   * @returns {Message[]}
   */
  function getMessages() {

    try {

      const storedData = localStorage.getItem(STORAGE_KEY);

      if (!storedData) {
        return [];
      }

      const parsedData = JSON.parse(storedData);

      if (!Array.isArray(parsedData)) {
        return [];
      }

      return parsedData.filter(isValidMessage);

    } catch (error) {

      console.error("Gagal mengambil data pesan:", error);

      return [];
    }
  }

  /**
   * @param {Message[]} messages
   * @returns {boolean}
   */
  function saveMessages(messages) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages)
      );

      return true;

    } catch (error) {

      console.error("Gagal menyimpan pesan:", error);

      return false;
    }
  }

  /* =====================================
     STATUS FORMULIR
  ===================================== */

  /**
   * @param {string} message
   * @param {"success" | "error"} type
   */
  function showStatus(message, type) {

    const status = document.getElementById("formStatus");

    if (!status) {
      return;
    }

    status.textContent = message;
    status.className = "form-status " + type;
  }

  /* =====================================
     TAMPILKAN PESAN
  ===================================== */

  const messagesList = document.getElementById("messagesList");

  /** @type {string} */
  let activeCategory = "Semua";

  function renderMessages() {

    if (!messagesList) {
      return;
    }

    const messages = getMessages();

    const filteredMessages = messages.filter(function (message) {
      return (
        activeCategory === "Semua" ||
        message.kategori === activeCategory
      );
    });

    messagesList.innerHTML = "";

    if (filteredMessages.length === 0) {

      messagesList.innerHTML = `
        <div class="empty-message">
          <span>💬</span>
          <p>
            Belum ada pesan. Jadilah orang pertama
            yang membagikan kebaikan! 💚
          </p>
        </div>
      `;

    } else {

      filteredMessages.slice().reverse().forEach(function (message) {

        const card = document.createElement("article");
        card.className = "message-card";

        const top = document.createElement("div");
        top.className = "message-card-top";

        const name = document.createElement("h3");
        name.textContent = message.nama;

        const category = document.createElement("span");
        category.className = "message-category";
        category.textContent = message.kategori;

        const content = document.createElement("p");
        content.textContent = message.isi;

        const date = document.createElement("small");
        date.className = "message-date";
        date.textContent = message.tanggal || "";

        top.appendChild(name);
        top.appendChild(category);

        card.appendChild(top);
        card.appendChild(content);
        card.appendChild(date);

        messagesList.appendChild(card);
      });
    }

    updateStatistics(messages);
  }

  /* =====================================
     STATISTIK PESAN
  ===================================== */

  /**
   * @param {Message[]} messages
   */
  function updateStatistics(messages) {

    const total = document.getElementById("totalMessages");
    const semangat = document.getElementById("totalSemangat");
    const terimaKasih = document.getElementById("totalTerimaKasih");
    const harapan = document.getElementById("totalHarapan");

    if (total) {
      total.textContent = String(messages.length);
    }

    if (semangat) {
      semangat.textContent = String(
        messages.filter(function (item) {
          return item.kategori === "Semangat";
        }).length
      );
    }

    if (terimaKasih) {
      terimaKasih.textContent = String(
        messages.filter(function (item) {
          return item.kategori === "Terima Kasih";
        }).length
      );
    }

    if (harapan) {
      harapan.textContent = String(
        messages.filter(function (item) {
          return item.kategori === "Harapan";
        }).length
      );
    }
  }

  /* =====================================
     FILTER KATEGORI
  ===================================== */

  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      activeCategory = button.dataset.category || "Semua";

      renderMessages();
    });
  });

  /* =====================================
     FORMULIR KIRIM PESAN
  ===================================== */

  const goodnessForm = document.getElementById("goodnessForm");

  if (goodnessForm) {

    goodnessForm.addEventListener("submit", function (event) {

      event.preventDefault();

      const namaInput = document.getElementById("namaPengirim");
      const kategoriInput = document.getElementById("kategoriPesan");
      const isiInput = document.getElementById("isiPesan");
      const submitButton = document.getElementById("submitButton");

      if (!namaInput || !kategoriInput || !isiInput) {

        showStatus(
          "Formulir tidak ditemukan. Periksa kembali HTML.",
          "error"
        );

        return;
      }

      const nama = /** @type {HTMLInputElement} */ (
        namaInput
      ).value.trim();

      const kategori = /** @type {HTMLSelectElement} */ (
        kategoriInput
      ).value;

      const isi = /** @type {HTMLTextAreaElement} */ (
        isiInput
      ).value.trim();

      if (!nama || !kategori || !isi) {

        showStatus(
          "Mohon lengkapi semua formulir.",
          "error"
        );

        return;
      }

      if (nama.length < 2) {

        showStatus(
          "Nama harus terdiri dari minimal 2 karakter.",
          "error"
        );

        return;
      }

      if (isi.length < 5) {

        showStatus(
          "Pesan terlalu singkat. Tuliskan pesan yang lebih lengkap.",
          "error"
        );

        return;
      }

      /** @type {Message} */
      const newMessage = {

        id: Date.now(),
        nama: nama,
        kategori: kategori,
        isi: isi,

        tanggal: new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short"
        })

      };

      const messages = getMessages();

      messages.push(newMessage);

      const saved = saveMessages(messages);

      if (!saved) {

        showStatus(
          "Pesan gagal disimpan. Periksa penyimpanan browser.",
          "error"
        );

        return;
      }

      goodnessForm.reset();

      showStatus(
        "Terima kasih! Pesan kebaikanmu berhasil dikirim. 💚",
        "success"
      );

      if (submitButton) {

        const button = /** @type {HTMLButtonElement} */ (
          submitButton
        );

        button.disabled = true;
        button.textContent = "Pesan berhasil dikirim!";

      }

      setTimeout(function () {

        window.location.href = "index.html#pesan";

      }, 1400);

    });

    goodnessForm.addEventListener("reset", function () {

      const status = document.getElementById("formStatus");

      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }

    });
  }

  /* =====================================
     KOSONGKAN SEMUA PESAN
  ===================================== */

  const clearButton = document.getElementById("clearMessages");

  if (clearButton) {

    clearButton.addEventListener("click", function () {

      const messages = getMessages();

      if (messages.length === 0) {
        alert("Belum ada pesan yang dapat dihapus.");
        return;
      }

      const confirmation = confirm(
        "Apakah kamu yakin ingin mengosongkan semua pesan pada browser ini?"
      );

      if (confirmation) {

        try {

          localStorage.removeItem(STORAGE_KEY);

          renderMessages();

          alert("Semua pesan berhasil dikosongkan.");

        } catch (error) {

          console.error("Gagal menghapus pesan:", error);

          alert("Pesan gagal dihapus. Silakan coba kembali.");

        }
      }
    });
  }

  /* =====================================
     KUTIPAN MOTIVASI BERGANTIAN
  ===================================== */

  /** @type {Quote[]} */
  const quotes = [

    {
      text: "Kebaikan kecil dapat membawa perubahan besar.",
      author: "Jejak Kebaikan"
    },

    {
      text: "Jadilah alasan seseorang tersenyum hari ini.",
      author: "Anonim"
    },

    {
      text: "Kata-kata baik dapat memberikan harapan baru.",
      author: "Anonim"
    },

    {
      text: "Berbagi kebaikan tidak akan membuat kita kekurangan.",
      author: "Anonim"
    },

    {
      text: "Mulailah perubahan dari diri sendiri.",
      author: "Anonim"
    }

  ];

  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");

  if (quoteText && quoteAuthor) {

    let quoteIndex = 0;

    setInterval(function () {

      quoteIndex = (quoteIndex + 1) % quotes.length;

      quoteText.style.opacity = "0";

      setTimeout(function () {

        quoteText.textContent = quotes[quoteIndex].text;

        quoteAuthor.textContent =
          "— " + quotes[quoteIndex].author;

        quoteText.style.opacity = "1";

      }, 350);

    }, 5000);
  }

  /* =====================================
     BAGIKAN LINK WEBSITE
  ===================================== */

  const shareWebsite = document.getElementById("shareWebsite");

  if (shareWebsite) {

    shareWebsite.addEventListener("click", async function () {

      const websiteUrl =
        window.location.origin + window.location.pathname;

      const shareData = {
        title: "Jejak Kebaikan",
        text: "Yuk, kunjungi Jejak Kebaikan dan sebarkan energi positif!",
        url: websiteUrl
      };

      try {

        if (navigator.share) {

          await navigator.share(shareData);

        } else if (navigator.clipboard &&
                   window.isSecureContext) {

          await navigator.clipboard.writeText(websiteUrl);

          alert("Link website berhasil disalin! 💚");

        } else {

          const temporaryInput = document.createElement("textarea");

          temporaryInput.value = websiteUrl;
          temporaryInput.style.position = "fixed";
          temporaryInput.style.opacity = "0";

          document.body.appendChild(temporaryInput);

          temporaryInput.select();

          const copied = document.execCommand("copy");

          temporaryInput.remove();

          if (copied) {
            alert("Link website berhasil disalin! 💚");
          } else {
            alert("Silakan salin link website dari alamat browser.");
          }
        }

      } catch (error) {

        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Gagal membagikan website:", error);

        alert(
          "Link belum berhasil dibagikan. Silakan coba kembali."
        );
      }
    });
  }

  /* =====================================
     PERBARUI DATA ANTAR TAB
  ===================================== */

  window.addEventListener("storage", function (event) {

    if (event.key === STORAGE_KEY) {
      renderMessages();
    }

  });

  /* =====================================
     JALANKAN SAAT HALAMAN DIBUKA
  ===================================== */

  renderMessages();

});
